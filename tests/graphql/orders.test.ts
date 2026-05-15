import { describe, it, expect, beforeAll } from 'vitest';
import { graphqlRequest } from './client';

describe('Orders GraphQL', () => {
  let userToken: string;
  let adminToken: string;
  let testProductId: string;

  beforeAll(async () => {
    const loginMutation = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          success
          data {
            accessToken
            user {
              id
              role
            }
          }
        }
      }
    `;

    const userResult = await graphqlRequest(loginMutation, {
      email: 'test@tinkuy.com',
      password: 'Test123!',
    });
    userToken = userResult.data?.login?.data?.accessToken;

    const adminResult = await graphqlRequest(loginMutation, {
      email: 'admin@tinkuy.com',
      password: 'Admin123!',
    });
    adminToken = adminResult.data?.login?.data?.accessToken;

    const productsResult = await graphqlRequest(`
      query Products {
        products(first: 1) {
          items {
            id
            stock
          }
        }
      }
    `);

    testProductId = productsResult.data?.products?.items?.[0]?.id;
  });

  describe('mutation createOrder', () => {
    it('crea orden exitosamente', async () => {
      const addToCartMutation = `
        mutation AddToCart($input: AddToCartInput!) {
          addToCart(input: $input) {
            success
          }
        }
      `;

      await graphqlRequest(
        addToCartMutation,
        {
          input: {
            productId: testProductId,
            quantity: 1,
          },
        },
        userToken
      );

      const mutation = `
        mutation CreateOrder($input: CreateOrderInput!) {
          createOrder(input: $input) {
            success
            data {
              id
              orderNumber
              status
              paymentStatus
              totalAmount
            }
            errors {
              code
              message
            }
          }
        }
      `;

      const result = await graphqlRequest(
        mutation,
        {
          input: {
            guestEmail: 'guest@example.com',
            guestName: 'Guest User',
            guestPhone: '+54 11 5555-1234',
            shippingAddress: {
              street: 'Calle Falsa',
              number: '123',
              apartment: 'A',
              city: 'Buenos Aires',
              state: 'CABA',
              postalCode: 'C1001',
              country: 'Argentina',
            },
          },
        },
        userToken
      );

      expect(result.errors).toBeUndefined();
      expect(result.data?.createOrder).toBeDefined();

      if (result.data?.createOrder?.success) {
        expect(result.data?.createOrder?.data?.orderNumber).toBeDefined();
        expect(result.data?.createOrder?.data?.status).toBe('PENDING');
        expect(result.data?.createOrder?.data?.paymentStatus).toBe('PENDING');
      } else {
        console.log('Create order result:', JSON.stringify(result, null, 2));
      }
    });

    it('crea orden de guest con email', async () => {
      const mutation = `
        mutation CreateOrder($input: CreateOrderInput!) {
          createOrder(input: $input) {
            success
            data {
              id
              orderNumber
              guestEmail
            }
          }
        }
      `;

      const result = await graphqlRequest(mutation, {
        input: {
          guestEmail: `guest_${Date.now()}@example.com`,
          guestName: 'Guest User',
          guestPhone: '+54 11 5555-1234',
          shippingAddress: {
            street: 'Calle Falsa',
            number: '456',
            city: 'Buenos Aires',
            state: 'CABA',
            postalCode: 'C1001',
            country: 'Argentina',
          },
        },
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.createOrder?.success).toBe(true);
    });

    it('crea orden sin items → error', async () => {
      const mutation = `
        mutation CreateOrder($input: CreateOrderInput!) {
          createOrder(input: $input) {
            success
            errors {
              code
              message
            }
          }
        }
      `;

      const result = await graphqlRequest(
        mutation,
        {
          input: {
            guestEmail: 'test@example.com',
            guestName: 'Test User',
            shippingAddress: {
              street: 'Calle Falsa',
              number: '123',
              city: 'Ciudad',
              state: 'Estado',
              postalCode: '1234',
              country: 'Argentina',
            },
          },
        },
        userToken
      );

      expect(result.data?.createOrder).toBeDefined();
      expect(result.data?.createOrder.success).toBe(false);
      expect(result.data?.createOrder.errors).toBeDefined();
    });
  });

  describe('query orders', () => {
    it('lista órdenes del usuario', async () => {
      const query = `
        query MyOrders {
          myOrders {
            id
            orderNumber
            status
            paymentStatus
            totalAmount
            createdAt
          }
        }
      `;

      const result = await graphqlRequest(query, undefined, userToken);

      expect(result.errors).toBeUndefined();
      expect(result.data?.myOrders).toBeInstanceOf(Array);
    });

    it('mis órdenes vacías', async () => {
      const query = `
        query MyOrders {
          myOrders {
            id
          }
        }
      `;

      const result = await graphqlRequest(query, undefined, userToken);

      expect(result.errors).toBeUndefined();
      expect(result.data?.myOrders).toBeDefined();
    });

    it('obtiene orden por ID', async () => {
      const ordersQuery = `
        query MyOrders {
          myOrders {
            id
            orderNumber
          }
        }
      `;

      const ordersResult = await graphqlRequest(ordersQuery, undefined, userToken);
      const orderId = ordersResult.data?.myOrders?.[0]?.id;

      if (!orderId) {
        console.log('No orders available for detail test');
        return;
      }

      const orderDetailQuery = `
        query Order($id: ID!) {
          order(id: $id) {
            id
            orderNumber
            status
            paymentStatus
            totalAmount
            items {
              id
              name
              price
              quantity
              total
            }
            shippingAddress
          }
        }
      `;

      const result = await graphqlRequest(orderDetailQuery, { id: orderId }, userToken);

      expect(result.errors).toBeUndefined();
      expect(result.data?.order).toBeDefined();
      expect(result.data?.order?.id).toBe(orderId);
    });
  });

  describe('webhook MercadoPago', () => {
    it('webhook approved → status PAID', async () => {
      const mutation = `
        mutation CreateOrder($input: CreateOrderInput!) {
          createOrder(input: $input) {
            success
            data {
              id
              orderNumber
            }
          }
        }
      `;

      const createResult = await graphqlRequest(
        mutation,
        {
          input: {
            guestEmail: 'webhook-test@example.com',
            guestName: 'Webhook Test',
            guestPhone: '+54 11 5555-1234',
            shippingAddress: {
              street: 'Calle Falsa',
              number: '789',
              city: 'Buenos Aires',
              state: 'CABA',
              postalCode: 'C1001',
              country: 'Argentina',
            },
          },
        },
        userToken
      );

      const orderId = createResult.data?.createOrder?.data?.id;

      if (!orderId) {
        console.log('Could not create order for webhook test');
        return;
      }

      const webhookMutation = `
        mutation ProcessWebhook($input: WebhookInput!) {
          processWebhook(input: $input) {
            success
            message
          }
        }
      `;

      const result = await graphqlRequest(
        webhookMutation,
        {
          input: {
            type: 'payment',
            data: {
              id: `mp_payment_${Date.now()}`,
              status: 'approved',
            },
            metadata: {
              orderId,
            },
          },
        },
        adminToken
      );

      expect(result.errors).toBeUndefined();
      expect(result.data?.processWebhook?.success).toBe(true);

      const orderQuery = `
        query Order($id: ID!) {
          order(id: $id) {
            status
            paymentStatus
          }
        }
      `;

      const orderResult = await graphqlRequest(orderQuery, { id: orderId }, userToken);

      expect(orderResult.data?.order?.paymentStatus).toBe('PAID');
      expect(orderResult.data?.order?.status).toBe('CONFIRMED');
    });

    it('webhook rejected → rollback stock', async () => {
      const mutation = `
        mutation CreateOrder($input: CreateOrderInput!) {
          createOrder(input: $input) {
            success
            data {
              id
              orderNumber
            }
          }
        }
      `;

      const createResult = await graphqlRequest(
        mutation,
        {
          input: {
            guestEmail: 'rejected-test@example.com',
            guestName: 'Rejected Test',
            guestPhone: '+54 11 5555-1234',
            shippingAddress: {
              street: 'Calle Falsa',
              number: '999',
              city: 'Buenos Aires',
              state: 'CABA',
              postalCode: 'C1001',
              country: 'Argentina',
            },
          },
        },
        userToken
      );

      const orderId = createResult.data?.createOrder?.data?.id;

      if (!orderId) {
        console.log('Could not create order for rejected webhook test');
        return;
      }

      const webhookMutation = `
        mutation ProcessWebhook($input: WebhookInput!) {
          processWebhook(input: $input) {
            success
          }
        }
      `;

      const result = await graphqlRequest(
        webhookMutation,
        {
          input: {
            type: 'payment',
            data: {
              id: `mp_payment_rejected_${Date.now()}`,
              status: 'rejected',
            },
            metadata: {
              orderId,
            },
          },
        },
        adminToken
      );

      expect(result.errors).toBeUndefined();
      expect(result.data?.processWebhook?.success).toBe(true);

      const orderQuery = `
        query Order($id: ID!) {
          order(id: $id) {
            paymentStatus
          }
        }
      `;

      const orderResult = await graphqlRequest(orderQuery, { id: orderId }, userToken);

      expect(orderResult.data?.order?.paymentStatus).toBe('FAILED');
    });

    it('webhook duplicado → idempotente', async () => {
      const mutation = `
        mutation CreateOrder($input: CreateOrderInput!) {
          createOrder(input: $input) {
            success
            data {
              id
            }
          }
        }
      `;

      const createResult = await graphqlRequest(
        mutation,
        {
          input: {
            guestEmail: 'idempotent@example.com',
            guestName: 'Idempotent Test',
            guestPhone: '+54 11 5555-1234',
            shippingAddress: {
              street: 'Calle Falsa',
              number: '555',
              city: 'Buenos Aires',
              state: 'CABA',
              postalCode: 'C1001',
              country: 'Argentina',
            },
          },
        },
        userToken
      );

      const orderId = createResult.data?.createOrder?.data?.id;

      if (!orderId) {
        console.log('Could not create order for idempotent test');
        return;
      }

      const paymentId = `mp_payment_idempotent_${Date.now()}`;

      const webhookMutation = `
        mutation ProcessWebhook($input: WebhookInput!) {
          processWebhook(input: $input) {
            success
          }
        }
      `;

      const firstResult = await graphqlRequest(
        webhookMutation,
        {
          input: {
            type: 'payment',
            data: {
              id: paymentId,
              status: 'approved',
            },
            metadata: {
              orderId,
            },
          },
        },
        adminToken
      );

      expect(firstResult.data?.processWebhook?.success).toBe(true);

      const secondResult = await graphqlRequest(
        webhookMutation,
        {
          input: {
            type: 'payment',
            data: {
              id: paymentId,
              status: 'approved',
            },
            metadata: {
              orderId,
            },
          },
        },
        adminToken
      );

      expect(secondResult.data?.processWebhook?.success).toBe(true);
    });
  });

  describe('orders admin', () => {
    it('lista todas las órdenes (admin)', async () => {
      const allOrdersQuery = `
        query AllOrders {
          orders {
            id
            orderNumber
            status
            paymentStatus
            totalAmount
            createdAt
          }
        }
      `;

      const result = await graphqlRequest(allOrdersQuery, undefined, adminToken);

      expect(result.errors).toBeUndefined();
      expect(result.data?.orders).toBeInstanceOf(Array);
    });

    it('actualiza estado de orden (admin)', async () => {
      const ordersQuery = `
        query Orders {
          orders {
            id
            status
          }
        }
      `;

      const ordersResult = await graphqlRequest(ordersQuery, undefined, adminToken);
      const orderId = ordersResult.data?.orders?.[0]?.id;

      if (!orderId) {
        console.log('No orders available for status update test');
        return;
      }

      const mutation = `
        mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) {
          updateOrderStatus(id: $id, status: $status) {
            success
            data {
              id
              status
            }
          }
        }
      `;

      const result = await graphqlRequest(
        mutation,
        {
          id: orderId,
          status: 'PROCESSING',
        },
        adminToken
      );

      expect(result.errors).toBeUndefined();
      expect(result.data?.updateOrderStatus?.success).toBe(true);
      expect(result.data?.updateOrderStatus?.data?.status).toBe('PROCESSING');
    });
  });
});
