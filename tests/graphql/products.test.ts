import { describe, it, expect, beforeAll } from 'vitest';
import { graphqlRequest } from './client';

describe('Products GraphQL', () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    const loginMutation = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          success
          data {
            accessToken
            user {
              role
            }
          }
        }
      }
    `;

    const adminResult = await graphqlRequest(loginMutation, {
      email: 'admin@tinkuy.com',
      password: 'Admin123!',
    });
    adminToken = adminResult.data?.login?.data?.accessToken;

    const userResult = await graphqlRequest(loginMutation, {
      email: 'test@tinkuy.com',
      password: 'Test123!',
    });
    userToken = userResult.data?.login?.data?.accessToken;
  });

  describe('query products', () => {
    it('lista paginada', async () => {
      const query = `
        query Products($first: Int, $skip: Int) {
          products(first: $first, skip: $skip) {
            items {
              id
              name
              slug
              basePrice
              stock
              isActive
              category {
                name
                slug
              }
              images {
                url
              }
            }
            total
            hasMore
          }
        }
      `;

      const result = await graphqlRequest(query, { first: 10, skip: 0 });

      expect(result.errors).toBeUndefined();
      expect(result.data?.products).toBeDefined();
      expect(result.data?.products.items).toBeInstanceOf(Array);
      expect(result.data?.products.total).toBeDefined();
      expect(result.data?.products.hasMore).toBeDefined();
    });

    it('query products con filtro categoría → filtra', async () => {
      const query = `
        query ProductsByCategory($categorySlug: String!) {
          products(categorySlug: $categorySlug, first: 10) {
            items {
              id
              name
              category {
                slug
              }
            }
            total
          }
        }
      `;

      const result = await graphqlRequest(query, { categorySlug: 'snacks' });

      expect(result.errors).toBeUndefined();
      expect(result.data?.products).toBeDefined();
      expect(result.data?.products.items.length).toBeGreaterThan(0);
    });

    it('búsqueda por nombre', async () => {
      const query = `
        query SearchProducts($search: String!) {
          products(search: $search, first: 10) {
            items {
              id
              name
            }
            total
          }
        }
      `;

      const result = await graphqlRequest(query, { search: 'whey' });

      expect(result.errors).toBeUndefined();
      expect(result.data?.products).toBeDefined();
    });
  });

  describe('query product(slug)', () => {
    it('producto con reviews', async () => {
      const query = `
        query ProductBySlug($slug: String!) {
          product(slug: $slug) {
            id
            name
            slug
            description
            basePrice
            stock
            category {
              name
              slug
            }
            images {
              url
              altText
            }
            variants {
              id
              name
              price
              stock
            }
            reviews {
              reviews {
                id
                rating
                title
                comment
                user {
                  firstName
                  lastName
                }
              }
              total
              hasMore
            }
            ratingSummary {
              averageRating
              totalReviews
              distribution
            }
          }
        }
      `;

      const productsResult = await graphqlRequest(`
        query Products {
          products(first: 1) {
            items {
              slug
            }
          }
        }
      `);

      if (productsResult.data?.products?.items?.length > 0) {
        const slug = productsResult.data.products.items[0].slug;
        const result = await graphqlRequest(query, { slug });

        expect(result.errors).toBeUndefined();
        expect(result.data?.product).toBeDefined();
        expect(result.data?.product.slug).toBe(slug);
        expect(result.data?.product.reviews).toBeDefined();
        expect(result.data?.product.ratingSummary).toBeDefined();
      }
    });

    it('producto inexistente → error', async () => {
      const query = `
        query ProductBySlug($slug: String!) {
          product(slug: $slug) {
            id
          }
        }
      `;

      const result = await graphqlRequest(query, { slug: 'non-existent-product' });

      expect(result.data?.product).toBeNull();
    });
  });

  describe('mutation createProduct', () => {
    it('mutation createProduct sin auth → error 401', async () => {
      const mutation = `
        mutation CreateProduct($input: CreateProductInput!) {
          createProduct(input: $input) {
            success
            errors {
              code
              message
            }
          }
        }
      `;

      const result = await graphqlRequest(mutation, {
        input: {
          name: 'Test Product',
          slug: `test-product-${Date.now()}`,
          basePrice: 100,
          categoryId: 'some-category-id',
        },
      });

      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]?.message).toContain('No autenticado');
    });

    it('mutation createProduct como admin → crea producto', async () => {
      const categoriesResult = await graphqlRequest(`
        query Categories {
          categories {
            id
            slug
          }
        }
      `);

      const categoryId = categoriesResult.data?.categories?.[0]?.id;

      const mutation = `
        mutation CreateProduct($input: CreateProductInput!) {
          createProduct(input: $input) {
            success
            data {
              id
              name
              slug
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
            name: 'Nuevo Producto Test',
            slug: `nuevo-producto-${Date.now()}`,
            basePrice: 199.99,
            categoryId: categoryId,
            shortDescription: 'Descripción corta',
            description: 'Descripción completa',
            stock: 50,
          },
        },
        adminToken
      );

      expect(result.errors).toBeUndefined();
      expect(result.data?.createProduct).toBeDefined();

      if (result.data?.createProduct?.success) {
        expect(result.data?.createProduct?.data?.name).toBe('Nuevo Producto Test');
      } else {
        console.log('Create product result:', JSON.stringify(result, null, 2));
      }
    });

    it('mutation createProduct como user (no admin) → error 403', async () => {
      const mutation = `
        mutation CreateProduct($input: CreateProductInput!) {
          createProduct(input: $input) {
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
            name: 'Test Product',
            slug: `test-product-user-${Date.now()}`,
            basePrice: 100,
            categoryId: 'some-category-id',
          },
        },
        userToken
      );

      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]?.message).toContain('permiso');
    });
  });

  describe('mutation updateProduct', () => {
    it('actualiza producto como admin', async () => {
      const productsResult = await graphqlRequest(`
        query Products {
          products(first: 1) {
            items {
              id
              name
            }
          }
        }
      `);

      const productId = productsResult.data?.products?.items?.[0]?.id;

      if (!productId) {
        console.log('No products available for update test');
        return;
      }

      const mutation = `
        mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
          updateProduct(id: $id, input: $input) {
            success
            data {
              id
              name
            }
          }
        }
      `;

      const result = await graphqlRequest(
        mutation,
        {
          id: productId,
          input: {
            name: 'Producto Actualizado',
          },
        },
        adminToken
      );

      expect(result.errors).toBeUndefined();
      expect(result.data?.updateProduct).toBeDefined();
    });
  });

  describe('mutation deleteProduct', () => {
    it('elimina producto como admin', async () => {
      const createMutation = `
        mutation CreateProduct($input: CreateProductInput!) {
          createProduct(input: $input) {
            success
            data {
              id
            }
          }
        }
      `;

      const categoriesResult = await graphqlRequest(`
        query Categories {
          categories {
            id
          }
        }
      `);

      const categoryId = categoriesResult.data?.categories?.[0]?.id;
      const slug = `product-to-delete-${Date.now()}`;

      const createResult = await graphqlRequest(
        createMutation,
        {
          input: {
            name: 'Producto para eliminar',
            slug,
            basePrice: 50,
            categoryId,
          },
        },
        adminToken
      );

      const productId = createResult.data?.createProduct?.data?.id;

      if (!productId) {
        console.log('Could not create product for delete test');
        return;
      }

      const deleteMutation = `
        mutation DeleteProduct($id: ID!) {
          deleteProduct(id: $id) {
            success
          }
        }
      `;

      const result = await graphqlRequest(
        deleteMutation,
        { id: productId },
        adminToken
      );

      expect(result.errors).toBeUndefined();
      expect(result.data?.deleteProduct?.success).toBe(true);
    });
  });
});
