"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUsers, FaUserMd, FaChartBar, FaSignOutAlt } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  onNavigate?: () => void;
  open: boolean;
  onClose: () => void;
}

const items = [
  { href: "/dashboard", label: "Inicio", icon: <FaChartBar size={18} /> },
  { href: "/dashboard/patients", label: "Pacientes", icon: <FaUsers size={18} /> },
  { href: "/dashboard/doctors", label: "Doctores", icon: <FaUserMd size={18} /> },
  { href: "/dashboard/users", label: "Usuarios", icon: <FaUserMd size={18} /> },
  { href: "/dashboard/companies", label: "Empresas", icon: <FaUserMd size={18} /> },
  { href: "/dashboard/clinics", label: "Clínicas", icon: <FaUserMd size={18} /> },
  { href: "/dashboard/appointments", label: "Citas", icon: <FaUserMd size={18} /> },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [openMobile, setOpenMobile] = useState(false);
  const { logout } = useAuth();

  // Cierra al cambiar ruta
  useEffect(() => {
    if (openMobile) setOpenMobile(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        aria-label="Abrir menú"
        className="lg:hidden fixed top-3 left-3 z-50 inline-flex h-10 w-10 items-center justify-center rounded-md border bg-white dark:bg-gray-900 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800"
        onClick={() => setOpenMobile((p) => !p)}
      >
        {openMobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Backdrop mobile */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-30 lg:hidden transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed z-40 inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-sm transition-transform",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center px-6 font-bold text-lg tracking-tight border-b border-gray-100 dark:border-gray-800">
          PHPF
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {items.map((it) => {
            const active = pathname === it.href || pathname.startsWith(it.href + "/");
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  "hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-900/30 dark:hover:text-teal-200",
                  active &&
                    "nav-active font-semibold ring-1 ring-teal-500/10 dark:ring-teal-300/20"
                )}
                onClick={onClose}
              >
                {it.icon}
                <span>{it.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}