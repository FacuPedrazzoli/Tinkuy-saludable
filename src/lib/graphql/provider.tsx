'use client';

import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import { setContext } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors, ServerError } from '@apollo/client/errors';
import { useMemo } from 'react';

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function createApolloClient() {
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  });

  const authLink = setContext(async (_, { headers }) => {
    if (typeof window === 'undefined') {
      return { headers };
    }
    const token = getCookieValue('graphql_token');
    return {
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  });

  const errorLink = new ErrorLink(({ error, operation, forward }) => {
    if (CombinedGraphQLErrors.is(error)) {
      for (const err of error.errors) {
        console.error(`[GraphQL Error]:`, {
          message: err.message,
          path: err.path,
          operation: operation.operationName,
        });
        if (err.extensions?.code === 'UNAUTHENTICATED') {
          document.cookie = 'graphql_token=; path=/; max-age=0';
          window.dispatchEvent(new Event('auth_error'));
        }
      }
    } else if (error instanceof ServerError) {
      console.error(`[Network Error]:`, error);
      if (error.statusCode === 401) {
        document.cookie = 'graphql_token=; path=/; max-age=0';
        window.dispatchEvent(new Event('auth_error'));
      }
    }
    return forward(operation);
  });

  return new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            products: {
              keyArgs: ['search', 'tagSlug', 'isVisible'],
              merge(existing, incoming, { args }) {
                if (!args?.skip || args.skip === 0) {
                  return incoming;
                }
                return {
                  ...incoming,
                  items: [...(existing?.items || []), ...(incoming?.items || [])],
                };
              },
            },
            orders: {
              keyArgs: ['status'],
              merge(existing, incoming, { args }) {
                if (!args?.skip || args.skip === 0) {
                  return incoming;
                }
                return {
                  ...incoming,
                  items: [...(existing?.items || []), ...(incoming?.items || [])],
                };
              },
            },
            categories: {
              merge(existing, incoming) {
                return incoming;
              },
            },
            coupons: {
              merge(existing, incoming) {
                return incoming;
              },
            },
            customers: {
              merge(existing, incoming) {
                return incoming;
              },
            },
          },
        },
        Product: {
          keyFields: ['id'],
        },
        Cart: {
          keyFields: ['id'],
        },
        Order: {
          keyFields: ['id'],
        },
        Category: {
          keyFields: ['id'],
        },
        Coupon: {
          keyFields: ['id'],
        },
        Customer: {
          keyFields: ['id'],
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: false,
      },
      query: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });
}

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => createApolloClient(), []);
  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}

export function getApolloClient() {
  return createApolloClient();
}
