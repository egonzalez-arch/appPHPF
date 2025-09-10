"use client";
import { AuthProvider } from "@/context/AuthContext";
import "../styles/globals.css"; // o el path real de tu CSS global

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}