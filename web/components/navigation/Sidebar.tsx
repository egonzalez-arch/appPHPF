"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNav } from "@/config/dashboardNav";
import { cn } from "@/lib/utils"; // Asume helper existente; si no, crea uno sencillo.
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const pathname = usePathname();
  const [openMobile, setOpenMobile] = useState(false);

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

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-60 shrink-0 border-r bg-white/95 backdrop-blur dark:bg-gray-900/95 dark:border-gray-800 flex flex-col",
          "transition-transform duration-300 ease-in-out",
          openMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-14 flex items-center px-5 border-b dark:border-gray-800">
          <Link
            href="/dashboard"
            className="font-bold text-lg tracking-tight text-gray-900 dark:text-gray-100"
          >
            PHPF
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {dashboardNav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                      "dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800",
                      active &&
                        "bg-teal-50 text-teal-700 hover:text-teal-700 hover:bg-teal-50 dark:bg-teal-900/30 dark:text-teal-200 dark:hover:bg-teal-900/40"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t dark:border-gray-800 p-3 text-xs text-gray-500 dark:text-gray-500">
          © {new Date().getFullYear()} PHPF
        </div>
      </aside>
    </>
  );
};