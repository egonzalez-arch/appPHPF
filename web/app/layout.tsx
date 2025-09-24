import './globals.css';
import { AppProviders } from './providers';

export const metadata = {
  title: 'App',
  description: 'Demo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}