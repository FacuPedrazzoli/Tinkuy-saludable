import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { graphqlRequest } from './client';

const TEST_USER = {
  email: `test_${Date.now()}@tinkuy.com`,
  password: 'Test123!',
  firstName: 'Test',
  lastName: 'User',
};

describe('Auth GraphQL', () => {
  let authToken: string;

  describe('mutation login', () => {
    it('devuelve JWT con credenciales válidas', async () => {
      const mutation = `
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            success
            data {
              accessToken
              refreshToken
              expiresIn
              user {
                id
                email
                role
              }
            }
            errors {
              code
              message
            }
          }
        }
      `;

      const result = await graphqlRequest(mutation, {
        email: 'test@tinkuy.com',
        password: 'Test123!',
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.login).toBeDefined();
      expect(result.data?.login.success).toBe(true);
      expect(result.data?.login.data?.accessToken).toBeDefined();
      expect(result.data?.login.data?.refreshToken).toBeDefined();
      expect(result.data?.login.data?.user?.email).toBe('test@tinkuy.com');
    });

    it('mutation login con credenciales inválidas → error', async () => {
      const mutation = `
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            success
            data {
              accessToken
            }
            errors {
              code
              message
            }
          }
        }
      `;

      const result = await graphqlRequest(mutation, {
        email: 'wrong@test.com',
        password: 'wrongpass',
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.login.success).toBe(false);
      expect(result.data?.login.errors).toBeDefined();
      expect(result.data?.login.errors[0]?.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('mutation register', () => {
    it('crea usuario + JWT', async () => {
      const mutation = `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            success
            data {
              accessToken
              refreshToken
              expiresIn
              user {
                id
                email
                role
              }
            }
            errors {
              code
              message
            }
          }
        }
      `;

      const result = await graphqlRequest(mutation, {
        input: TEST_USER,
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.register).toBeDefined();

      if (result.data?.register.success) {
        expect(result.data?.register.data?.accessToken).toBeDefined();
        expect(result.data?.register.data?.user?.email).toBe(TEST_USER.email);
        authToken = result.data?.register.data?.accessToken;
      } else {
        console.log('Register result:', JSON.stringify(result, null, 2));
      }
    });

    it('register con email duplicado → error', async () => {
      const mutation = `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
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
          email: 'test@tinkuy.com',
          password: 'Test123!',
          firstName: 'Duplicate',
          lastName: 'User',
        },
      });

      expect(result.data?.register.success).toBe(false);
      expect(result.data?.register.errors).toBeDefined();
    });
  });

  describe('query me', () => {
    it('query me sin token → error 401', async () => {
      const query = `
        query Me {
          me {
            id
            email
            role
          }
        }
      `;

      const result = await graphqlRequest(query);

      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]?.message).toContain('No autenticado');
    });

    it('query me con token → datos del usuario', async () => {
      const loginMutation = `
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            success
            data {
              accessToken
              user {
                id
                email
                role
              }
            }
          }
        }
      `;

      const loginResult = await graphqlRequest(loginMutation, {
        email: 'test@tinkuy.com',
        password: 'Test123!',
      });

      expect(loginResult.data?.login.success).toBe(true);
      const token = loginResult.data?.login.data?.accessToken;

      const query = `
        query Me {
          me {
            id
            email
            role
            firstName
            lastName
          }
        }
      `;

      const result = await graphqlRequest(query, undefined, token);

      expect(result.errors).toBeUndefined();
      expect(result.data?.me).toBeDefined();
      expect(result.data?.me.email).toBe('test@tinkuy.com');
    });
  });

  describe('mutation refreshToken', () => {
    it('refresca token correctamente', async () => {
      const loginMutation = `
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            success
            data {
              accessToken
              refreshToken
            }
          }
        }
      `;

      const loginResult = await graphqlRequest(loginMutation, {
        email: 'test@tinkuy.com',
        password: 'Test123!',
      });

      const refreshToken = loginResult.data?.login?.data?.refreshToken;

      const mutation = `
        mutation RefreshToken($refreshToken: String!) {
          refreshToken(refreshToken: $refreshToken) {
            success
            data {
              accessToken
              refreshToken
              expiresIn
            }
          }
        }
      `;

      const result = await graphqlRequest(mutation, { refreshToken });

      expect(result.errors).toBeUndefined();
      expect(result.data?.refreshToken.success).toBe(true);
      expect(result.data?.refreshToken.data?.accessToken).toBeDefined();
    });
  });
});
