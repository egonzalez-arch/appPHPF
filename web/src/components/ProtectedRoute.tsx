'use client';
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

type Props = { children: React.ReactNode; roles?: string[] };

const ProtectedRoute: React.FC<Props> = ({ children, roles }) => {
  const { token, user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!token) {
      if (typeof window !== 'undefined') window.location.href = '/login';
      return;
    }
    if (roles && roles.length > 0) {
      const ok = user?.roles?.some((r) => roles.includes(r));
      if (!ok && typeof window !== 'undefined') window.location.href = '/403';
    }
  }, [loading, token, user, roles]);

  if (loading) return null;
  return <>{children}</>;
};

export default ProtectedRoute;