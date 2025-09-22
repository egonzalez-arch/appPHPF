import React from 'react';
import { useAuth } from '@/context/AuthContext';

export function withAuth<P>(Wrapped: React.ComponentType<P>) {
  return function ComponentWithAuth(props: P) {
    const { user, loading } = useAuth();
    if (loading) return <div>Cargando...</div>;
    if (!user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }
    return <Wrapped {...props} />;
  };
}