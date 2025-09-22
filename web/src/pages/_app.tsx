import type { AppProps } from 'next/app';
import { AuthProvider } from '@/context/AuthContext';

export default function MyApp({ Component, pageProps }: AppProps & { Component: any }) {
  const getLayout = Component.getLayout || ((page: any) => page);
  return (
    <AuthProvider>
      {getLayout(<Component {...pageProps} />)}
    </AuthProvider>
  );
}