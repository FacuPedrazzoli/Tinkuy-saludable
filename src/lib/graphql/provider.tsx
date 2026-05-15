'use client';

import { ApolloClient, InMemoryCache, createHttpLink, from, ServerError } from '@apollo/client';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { useMemo } from 'react';

function createApolloClient() {
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  });

  const authLink = setContext(async (_, { headers }) => {
    if (typeof window === 'undefined') {
      return { headers };
    }
    const token = localStorage.getItem('auth_token');
    return {
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  });

  const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        console.error(`[GraphQL Error]:`, {
          message: err.message,
          path: err.path,
          operation: operation.operationName,
        });
        if (err.extensions?.code === 'UNAUTHENTICATED') {
          document.cookie = 'auth_token=; path=/; max-age=0';
          document.cookie = 'auth_user=; path=/; max-age=0';
          window.dispatchEvent(new Event('auth_error'));
        }
      }
    }
    if (networkError) {
      console.error(`[Network Error]:`, networkError);
      if (networkError.statusCode === 401) {
        document.cookie = 'auth_token=; path=/; max-age=0';
        document.cookie = 'auth_user=; path=/; max-age=0';
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
