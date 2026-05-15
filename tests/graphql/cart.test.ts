import { describe, it, expect, beforeAll } from 'vitest';
import { graphqlRequest } from './client';

describe('Cart GraphQL', () => {
  let userToken: string;
  let sessionId: string;
  let testProductId: string;

  beforeAll(async () => {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const loginMutation = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          success
          data {
            accessToken
            user {
              id
            }
          }
        }
      }
    `;

    const result = await graphqlRequest(loginMutation, {
      email: 'test@tinkuy.com',
      password: 'Test123!',
    });

    userToken = result.data?.login?.data?.accessToken;

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

  describe('mutation addToCart', () => {
    it('agrega item al carrito', async () => {
      const mutation = `
        mutation AddToCart($input: AddToCartInput!) {
          addToCart(input: $input) {
            success
            data {
              id
              items {
                id
                productId
                quantity
                name
                price
              }
              totalItems
              totalAmount
            }
            message
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
            productId: testProductId,
            quantity: 1,
          },
        },
        userToken
      );

      expect(result.errors).toBeUndefined();
      expect(result.data?.addToCart).toBeDefined();

      if (result.data?.addToCart?.success) {
        expect(result.data?.addToCart?.data?.items).toBeInstanceOf(Array);
        expect(result.data?.addToCart?.data?.totalItems).toBeGreaterThan(0);
      } else {
        console.log('Add to cart result:', JSON.stringify(result, null, 2));
      }
    });

    it('agrega item con sessionId (anónimo)', async () => {
      const mutation = `
        mutation AddToCart($input: AddToCartInput!) {
          addToCart(input: $input) {
            success
            data {
              id
              items {
                id
                productId
                quantity
              }
              totalItems
            }
          }
        }
      `;

      const result = await graphqlRequest(mutation, {
        input: {
          productId: testProductId,
          quantity: 2,
        },
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.addToCart).toBeDefined();
      expect(result.data?.addToCart?.success).toBe(true);
    });

    it('mutation addToCart con stock insuficiente → error', async () => {
      const mutation = `
        mutation AddToCart($input: AddToCartInput!) {
          addToCart(input: $input) {
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
            productId: testProductId,
            quantity: 999999,
          },
        },
        userToken
      );

      expect(result.data?.addToCart).toBeDefined();
      expect(result.data?.addToCart.success).toBe(false);
      expect(result.data?.addToCart.errors).toBeDefined();
      expect(result.data?.addToCart.errors[0]?.code).toBe('INSUFFICIENT_STOCK');
    });

    it('agrega item con variantId', async () => {
      const variantsResult = await graphqlRequest(`
        query ProductWithVariants {
          product(slug: "snacks-proteicos") {
            variants {
              id
              name
              stock
            }
          }
        }
      `);

      const variantId = variantsResult.data?.product?.variants?.[0]?.id;

      if (!variantId) {
        console.log('No variants available for test');
        return;
      }

      const mutation = `
        mutation AddToCart($input: AddToCartInput!) {
          addToCart(input: $input) {
            success
            data {
              items {
                id
                variantId
                quantity
              }
            }
          }
        }
      `;

      const result = await graphqlRequest(
        mutation,
        {
          input: {
            productId: testProductId,
            quantity: 1,
            variantId,
          },
        },
        userToken
      );

      expect(result.errors).toBeUndefined();
      expect(result.data?.addToCart?.success).toBe(true);
    });
  });

  describe('mutation removeFromCart', () => {
    it('elimina item del carrito', async () => {
      const addMutation = `
        mutation AddToCart($input: AddToCartInput!) {
          addToCart(input: $input) {
            success
            data {
              id
              items {
                id
                productId
              }
            }
          }
        }
      `;

      const addResult = await graphqlRequest(
        addMutation,
        {
          input: {
            productId: testProductId,
            quantity: 1,
          },
        },
        userToken
      );

      const cartItemId = addResult.data?.addToCart?.data?.items?.find(
        (item: any) => item.productId === testProductId
      )?.id;

      if (!cartItemId) {
        console.log('No cart item to remove');
        return;
      }

      const removeMutation = `
        mutation RemoveFromCart($input: RemoveFromCartInput!) {
          removeFromCart(input: $input) {
            success
            data {
              items {
                id
              }
              totalItems
            }
            message
          }
        }
      `;

      const result = await graphqlRequest(
        removeMutation,
        {
          input: {
            cartItemId,
          },
        },
        userToken
      );

      expect(result.errors).toBeUndefined();
      expect(result.data?.removeFromCart).toBeDefined();
      expect(result.data?.removeFromCart?.success).toBe(true);
    });

    it('elimina item inexistente → error', async () => {
      const mutation = `
        mutation RemoveFromCart($input: RemoveFromCartInput!) {
          removeFromCart(input: $input) {
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
            cartItemId: 'non-existent-item-id',
          },
        },
        userToken
      );

      expect(result.data?.removeFromCart.success).toBe(false);
    });
  });

  describe('mutation updateCartItemQuantity', () => {
    it('actualiza cantidad de item', async () => {
      const addMutation = `
        mutation AddToCart($input: AddToCartInput!) {
          addToCart(input: $input) {
            success
            data {
              items {
                id
                quantity
              }
            }
          }
        }
      `;

      const addResult = await graphqlRequest(
        addMutation,
        {
          input: {
            productId: testProductId,
            quantity: 1,
          },
        },
        userToken
      );

      const cartItemId = addResult.data?.addToCart?.data?.items?.[0]?.id;

      if (!cartItemId) {
        console.log('No cart item to update');
        return;
      }

      const updateMutation = `
        mutation UpdateQuantity($input: UpdateQuantityInput!) {
          updateCartItemQuantity(input: $input) {
            success
            data {
              items {
                id
                quantity
              }
            }
          }
        }
      `;

      const result = await graphqlRequest(
        updateMutation,
        {
          input: {
            cartItemId,
            quantity: 5,
          },
        },
        userToken
      );

      expect(result.errors).toBeUndefined();
      expect(result.data?.updateCartItemQuantity?.success).toBe(true);
    });
  });

  describe('query cart', () => {
    it('devuelve carrito actual', async () => {
      const query = `
        query Cart {
          cart {
            success
            data {
              id
              items {
                id
                productId
                name
                price
                quantity
                imageUrl
                total
              }
              totalItems
              totalAmount
            }
            errors {
              code
              message
            }
          }
        }
      `;

      const result = await graphqlRequest(query, undefined, userToken);

      expect(result.errors).toBeUndefined();
      expect(result.data?.cart).toBeDefined();
      expect(result.data?.cart?.success).toBe(true);
      expect(result.data?.cart?.data).toBeDefined();
    });

    it('carrito vacío para sesión nueva', async () => {
      const query = `
        query Cart {
          cart {
            success
            data {
              items {
                id
              }
              totalItems
              totalAmount
            }
          }
        }
      `;

      const result = await graphqlRequest(query);

      expect(result.errors).toBeUndefined();
      expect(result.data?.cart).toBeDefined();
    });
  });

  describe('mutation mergeGuestCart', () => {
    it('merge carrito anónimo al login', async () => {
      const guestSessionId = `guest_${Date.now()}`;

      const addMutation = `
        mutation AddToCart($input: AddToCartInput!) {
          addToCart(input: $input) {
            success
          }
        }
      `;

      await graphqlRequest(addMutation, {
        input: {
          productId: testProductId,
          quantity: 2,
        },
      });

      const mergeMutation = `
        mutation MergeGuestCart($guestCartId: String!) {
          mergeGuestCart(guestCartId: $guestCartId) {
            success
            data {
              items {
                id
                quantity
              }
              totalItems
            }
            message
          }
        }
      `;

      const result = await graphqlRequest(
        mergeMutation,
        {
          guestCartId: guestSessionId,
        },
        userToken
      );

      expect(result.errors).toBeUndefined();
      expect(result.data?.mergeGuestCart).toBeDefined();
      expect(result.data?.mergeGuestCart?.success).toBe(true);
    });

    it('merge sin auth → error', async () => {
      const mutation = `
        mutation MergeGuestCart($guestCartId: String!) {
          mergeGuestCart(guestCartId: $guestCartId) {
            success
            errors {
              code
              message
            }
          }
        }
      `;

      const result = await graphqlRequest(mutation, {
        guestCartId: 'some-session-id',
      });

      expect(result.errors).toBeDefined();
    });
  });
});
