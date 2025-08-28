import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { AuthProvider } from '../context/AuthContext'
import "../app/globals.css";


export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Navbar />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 p-6">{children}</main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}