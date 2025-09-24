'use client';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function ReactQueryProvider({ children }: { children: ReactNode }) {
  // Usar un estado para garantizar una sola instancia en cliente.
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      {children}
      {/* Quita devtools en producción si deseas */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}