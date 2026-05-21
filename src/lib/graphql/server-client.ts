import { ApolloClient, InMemoryCache, createHttpLink, DocumentNode } from '@apollo/client';

/**
 * Creates a one-shot Apollo client for server-side (RSC / generateStaticParams) use.
 * Each call returns a fresh client — safe for concurrent SSR.
 */
function createServerApolloClient() {
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
    headers: {
      ...(process.env.NEXT_PUBLIC_TENANT_ID
        ? { 'x-tenant-id': process.env.NEXT_PUBLIC_TENANT_ID }
        : {}),
    },
  });

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
    },
  });
}

export async function serverQuery<TData, TVariables extends object = object>(
  query: DocumentNode,
  variables?: TVariables
): Promise<TData | null> {
  try {
    const client = createServerApolloClient();
    const { data } = await client.query<TData>({
      query,
      variables,
    });
    return data ?? null;
  } catch {
    return null;
  }
}
