import type { AppProps } from 'next/app';
import React from 'react';
import { AuthProvider } from '../src/context/AuthContext';
import { DashboardLayout } from '../src/components/layout/DashboardLayout';

export default function MyApp({ Component, pageProps, router }: AppProps) {
  const isDashboard = router.pathname.startsWith('/dashboard');

  const content = isDashboard ? (
    <DashboardLayout>
      <Component {...pageProps} />
    </DashboardLayout>
  ) : (
    <Component {...pageProps} />
  );

  return <AuthProvider>{content}</AuthProvider>;
}