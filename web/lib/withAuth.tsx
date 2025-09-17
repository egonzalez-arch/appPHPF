"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ComponentType } from 'react';

interface WithAuthOptions {
  redirectTo?: string;
  requiredRole?: string;
  requireAuth?: boolean;
}

export function withAuth<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    redirectTo = '/login',
    requiredRole,
    requireAuth = true,
  } = options;

  return function AuthenticatedComponent(props: P) {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // If authentication is not required, allow access
      if (!requireAuth) return;

      // If no user and auth is required, redirect to login
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // If specific role is required and user doesn't have it
      if (requiredRole && user.role !== requiredRole) {
        router.push('/dashboard'); // Redirect to dashboard instead of login
        return;
      }
    }, [user, router]);

    // Show loading state while checking auth
    if (requireAuth && !user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // Show loading state while checking role
    if (requireAuth && requiredRole && user?.role !== requiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Helper HOCs for common scenarios
export const withAdminAuth = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, { requiredRole: 'administrador' });

export const withDoctorAuth = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, { requiredRole: 'doctor' });

export const withPatientAuth = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, { requiredRole: 'paciente' });

export const withAnyAuth = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, { requireAuth: true });

export const withoutAuth = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, { requireAuth: false });