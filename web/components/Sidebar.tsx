"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const menu = [
  {
    label: "Pacientes",
    icon: "👥",
    children: [
      { label: "Dashboard", href: "/patients" },
      { label: "Citas", href: "/patients/citas" },
      { label: "Registro", href: "/patients/registro" },
    ],
  },
  {
    label: "Doctor",
    icon: "🩺",
    children: [
      { label: "Dashboard", href: "/doctor/dashboard" },
      { label: "Consultas", href: "/doctor/consultas" },
      { label: "Nueva Consulta", href: "/doctor/consultas/nueva" },
      { label: "Laboratorio", href: "/doctor/laboratorio" },
    ],
  },
  {
    label: "Agenda",
    icon: "📅",
    children: [
      { label: "Semana", href: "/agenda/semana" },
      { label: "Día", href: "/agenda/dia" },
    ],
  },
  {
    label: "Reportes",
    icon: "📊",
    href: "/reportes",
  },
];

export default function Sidebar() {
  const [open, setOpen] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-teal-600 text-white flex flex-col shadow-xl">
      <div className="py-6 px-6 border-b border-teal-700 flex items-center gap-2">
        <span className="text-2xl mr-2">🩻</span>
        <span className="font-bold text-xl tracking-wide">MediDash</span>
      </div>
      <nav className="flex-1 py-6 px-4">
        <ul className="space-y-2">
          {menu.map((item) => (
            <li key={item.label}>
              {item.children ? (
                <>
                  <button
                    className={`flex items-center w-full px-4 py-2 rounded-lg hover:bg-teal-700 transition group ${
                      open === item.label ? "bg-teal-700" : ""
                    }`}
                    onClick={() => setOpen(open === item.label ? null : item.label)}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span className="flex-1 text-left font-semibold group-hover:text-teal-200">{item.label}</span>
                    <span className="ml-2 text-xs">{open === item.label ? "▲" : "▼"}</span>
                  </button>
                  {open === item.label && (
                    <ul className="ml-7 mt-1 space-y-1 border-l border-teal-200 pl-3">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <a
                            href={child.href}
                            className="block px-3 py-1 rounded-lg font-medium text-teal-100 hover:text-white hover:bg-teal-500 transition duration-150"
                          >
                            {child.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <a
                  href={item.href}
                  className="flex items-center px-4 py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="py-4 px-6 border-t border-teal-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 bg-teal-700 hover:bg-red-500 text-white py-2 px-4 rounded-lg font-semibold transition"
        >
          <span className="text-lg">🚪</span>
          <span>Salir / Logout</span>
        </button>
      </div>
      <div className="py-3 px-6 text-xs text-teal-200">
        <span>© 2025 MediDash</span>
      </div>
    </aside>
  );
}