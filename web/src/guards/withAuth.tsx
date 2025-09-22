import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';

/**
 * HOC para proteger páginas privadas.
 * Redirige a /login si no hay usuario (tras terminar loading).
 */
export function withAuth<P>(Wrapped: React.ComponentType<P>) {
  const ComponentWithAuth = (props: P) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.replace('/login');
      }
    }, [loading, user, router]);

    if (loading || !user) {
      return <div className="loader-container">Cargando...</div>;
    }

    return <Wrapped {...props} />;
  };
  return ComponentWithAuth;
}