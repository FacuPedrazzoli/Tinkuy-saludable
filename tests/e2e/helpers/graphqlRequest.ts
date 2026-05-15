const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://localhost:3000/api/graphql';

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

export async function graphqlRequest<T = any>(
  query: string,
  variables?: Record<string, any>,
  token?: string
): Promise<GraphQLResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  return response.json();
}

export function getTestToken(payload: { userId: string; role?: string }): string {
  const { sign } = require('jsonwebtoken');
  return sign(
    { userId: payload.userId, type: 'access', role: payload.role || 'USER' },
    process.env.ACCESS_TOKEN_SECRET || 'access-token-secret',
    { expiresIn: '15m' }
  );
}
