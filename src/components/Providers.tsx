'use client';

import { ApolloProvider } from '@/lib/graphql/provider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/hooks/useAuth';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ApolloProvider>
          {children}
        </ApolloProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
