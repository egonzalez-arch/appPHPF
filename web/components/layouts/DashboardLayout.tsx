"use client";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SidebarItem } from "@/components/layouts/SidebarItem";
import { NavigationMenu } from "@/components/ui/navigation-menu";
import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Dialog } from "@/components/ui/dialog";
import { Toast } from "@/components/ui/toast";

const MENU_ITEMS = [
  { href: "/dashboard/patients", label: "Pacientes", icon: "👥" },
  { href: "/dashboard/doctors", label: "Doctores", icon: "🩺" },
  { href: "/dashboard/appointments", label: "Citas", icon: "📅" },
  { href: "/dashboard/records", label: "Expedientes", icon: "📋" },
  { href: "/dashboard/reports", label: "Reportes", icon: "📊" },
  { href: "/dashboard/users", label: "Usuarios", icon: "👤" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const { user, logout } = useAuth();

  // Obtiene el nombre del usuario, con fallback
  const userName =
    user?.name ||
    user?.nombre ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "Usuario";

  // Función para mostrar diálogo
  const handleLogoutClick = () => setConfirmOpen(true);

  // Confirmación de logout
  const handleConfirmLogout = () => {
    setConfirmOpen(false);
    setToastOpen(true);
    setTimeout(() => {
      logout();
    }, 1200); // Espera para mostrar el toast antes de redirigir
  };

  // Cancela el diálogo
  const handleCancelLogout = () => setConfirmOpen(false);

  return (
    <div className={darkMode ? "dark bg-background" : "bg-background"}>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`bg-teal-700 text-white flex flex-col transition-all duration-300
            ${collapsed ? "w-16" : "w-64"} min-h-screen border-r border-teal-900`}
          aria-label="Sidebar"
        >
          {/* Header del sidebar adaptado para ambos estados */}
          <div className={`flex items-center ${collapsed ? "justify-center px-0 py-4" : "justify-between px-6 py-4"}`}>
            {!collapsed && (
              <span className="text-xl font-bold tracking-tight">
                Buen dia {userName}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((v) => !v)}
              className={collapsed ? "mx-auto" : ""}
            >
              {collapsed ? "›" : "‹"}
            </Button>
          </div>
          {/* Navigation */}
          <nav className="flex-1 mt-4">
            <NavigationMenu orientation="vertical">
              {MENU_ITEMS.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={pathname.startsWith(item.href)}
                  collapsed={collapsed}
                />
              ))}
            </NavigationMenu>
          </nav>
          <div className="mt-auto mb-4 px-6 flex flex-col gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle dark mode"
              onClick={() => setDarkMode((d) => !d)}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              className="w-full mt-2"
              variant="secondary"
              aria-label="Logout"
              onClick={handleLogoutClick}
            >
              Salir / Logout
            </Button>
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-background px-4 py-6">
          {/* Optional Topbar */}
          <Card className="mb-6 flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 shadow rounded-lg">
            <span className="font-medium text-teal-700 dark:text-teal-300">
              Bienvenido, {userName}
            </span>
          </Card>
          {children}
        </main>
        {/* Diálogo de confirmación */}
        <Dialog
          open={confirmOpen}
          title="¿Cerrar sesión?"
          onConfirm={handleConfirmLogout}
          onCancel={handleCancelLogout}
        >
          ¿Estás seguro que deseas cerrar sesión? Esta acción requiere volver a iniciar sesión para acceder nuevamente al sistema.
        </Dialog>
        {/* Toast de éxito */}
        <Toast
          open={toastOpen}
          message="Sesión cerrada correctamente."
          onClose={() => setToastOpen(false)}
        />
      </div>
    </div>
  );
}