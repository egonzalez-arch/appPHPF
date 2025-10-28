'use client';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function ReactQueryProvider({ children }: { children: ReactNode }) {
  // Usar un estado para garantizar una sola instancia en cliente.
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Configuración de cache mejorada para catálogos de baja rotación
        staleTime: 5 * 60 * 1000, // 5 minutos - datos considerados frescos
        gcTime: 10 * 60 * 1000, // 10 minutos - tiempo en cache (antes cacheTime)
        refetchOnWindowFocus: false, // No refetch automático al enfocar ventana
        retry: 1, // Solo 1 reintento en caso de error
      },
    },
  }));
  return (
    <QueryClientProvider client={client}>
      {children}
      {/* Quita devtools en producción si deseas */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}