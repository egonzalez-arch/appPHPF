"use client";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SidebarItem } from "@/components/layouts/SidebarItem";
import { NavigationMenu } from "@/components/ui/navigation-menu";
import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { FaUsers, FaUserMd, FaCalendarAlt, FaChartBar, FaTools, FaGift, FaSearch, FaUser } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { Dialog } from "@/components/ui/dialog";
import { Toast } from "@/components/ui/toast";

const MENU_ITEMS = [
  { href: "/dashboard/patients", label: "Pacientes", icon: <FaUsers size={24} /> },
  { href: "/dashboard/doctors", label: "Doctores", icon: <FaUserMd size={24} /> },
  { href: "/dashboard/appointments", label: "Citas", icon: <FaCalendarAlt size={24} /> },
  { href: "/dashboard/records", label: "Expedientes", icon: <FaChartBar size={24} /> },
  { href: "/dashboard/reports", label: "Reportes", icon: <FaChartBar size={24} /> },
  { href: "/dashboard/users", label: "Usuarios", icon: <FaUser size={24} /> },
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

  // Obtiene la inicial del usuario
  const userInitial = userName?.[0]?.toUpperCase() || "U";

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
    <div className={darkMode ? "dark bg-gray-50" : "bg-gray-50"}>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`bg-gray-900 text-white flex flex-col transition-all duration-300
            ${collapsed ? "w-16" : "w-64"} min-h-screen shadow-xl`}
          aria-label="Sidebar"
        >
          {/* Logo/Header del sidebar */}
          <div className={`flex items-center ${collapsed ? "justify-center px-0 py-6" : "justify-between px-6 py-6"} border-b border-gray-700`}>
            {!collapsed && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">🩻</span>
                <span className="text-xl font-bold tracking-tight">
                  MediDash
                </span>
              </div>
            )}
            {collapsed && <span className="text-2xl">🩻</span>}
            <Button
              variant="ghost"
              size="icon"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((v) => !v)}
              className={`${collapsed ? "mx-auto mt-2" : ""} text-gray-300 hover:text-white hover:bg-gray-800`}
            >
              {collapsed ? "›" : "‹"}
            </Button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 py-6">
            <div className="space-y-2 px-3">
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
            </div>
          </nav>
          
          {/* Bottom section with user info and logout */}
          <div className="mt-auto mb-4 px-3 border-t border-gray-700 pt-4">
            {!collapsed && (
              <div className="px-3 py-2 mb-3">
                <p className="text-xs text-gray-400 mb-1">Conectado como:</p>
                <p className="text-sm font-medium truncate">{userName}</p>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-2 mb-2">
              <div className="bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                {userInitial}
              </div>
              {!collapsed && <span className="text-sm font-medium">{userName}</span>}
            </div>
            <Button
              className={`w-full ${collapsed ? "px-2" : ""}`}
              variant="secondary"
              aria-label="Logout"
              onClick={handleLogoutClick}
            >
              {collapsed ? "↪" : "Salir / Logout"}
            </Button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left side - Logo and Action Buttons */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 mr-6">
                  <span className="text-2xl">🩻</span>
                  <span className="text-xl font-bold text-teal-700">MediDash</span>
                </div>
                
                <button className="flex items-center gap-2 border-2 border-teal-700 bg-white text-teal-700 font-semibold px-4 py-2 rounded-lg transition shadow hover:bg-teal-50">
                  <FaUsers size={16} />
                  Nuevo Paciente
                </button>
                <button className="flex items-center gap-2 border-2 border-gray-300 bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg transition shadow hover:bg-gray-100">
                  <FaTools size={16} />
                  Herramientas
                </button>
                <button className="flex items-center gap-2 border-2 border-yellow-400 bg-yellow-400 text-gray-900 font-semibold px-4 py-2 rounded-lg transition shadow hover:bg-yellow-300">
                  <FaGift size={16} />
                  Recomendar
                </button>
              </div>

              {/* Right side - Search and User Actions */}
              <div className="flex items-center gap-4">
                {/* Patient Search */}
                <div className="flex items-center bg-gray-50 rounded-lg px-4 py-2 border border-gray-200 min-w-[300px]">
                  <FaSearch className="text-gray-400 mr-3" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar paciente por nombre o teléfono..."
                    className="outline-none border-none text-sm bg-transparent flex-1 text-gray-700 placeholder-gray-400"
                  />
                </div>

                {/* User Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Toggle dark mode"
                    onClick={() => setDarkMode((d) => !d)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                  
                  <div className="bg-teal-600 text-white rounded-full w-9 h-9 flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-teal-700 transition">
                    {userInitial}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>

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