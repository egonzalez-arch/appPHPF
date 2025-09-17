import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export function withAuth<P>(Component: React.ComponentType<P>) {
  const Wrapped: React.FC<P> = (props) => {
    const { token } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!token) router.replace('/login');
    }, [token, router]);

    if (!token) return null; // o un loader
    return <Component {...props} />;
  };
  return Wrapped;
}