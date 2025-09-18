import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export function withAuth<P>(Wrapped: React.ComponentType<P>) {
  return function Protected(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();
    useEffect(() => {
      if (!loading && !user) router.replace('/login');
    }, [loading, user, router]);
    if (loading || !user) return <div>Cargando...</div>;
    return <Wrapped {...props} />;
  };
}