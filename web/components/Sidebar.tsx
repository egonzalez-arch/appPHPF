"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const icons = {
  pacientes: <span className="text-2xl">👥</span>,
  doctor: <span className="text-2xl">🩺</span>,
  agenda: <span className="text-2xl">📅</span>,
  reportes: <span className="text-2xl">📊</span>,
};

const menu = [
  {
    label: "Pacientes",
    icon: icons.pacientes,
    children: [
      { label: "Dashboard", href: "/dashboard/patients" },
      { label: "Citas", href: "/dashboard/patients/citas" },
      { label: "Registro", href: "/dashboard/patients/registro" },
    ],
  },
  {
    label: "Doctor",
    icon: icons.doctor,
    children: [
      { label: "Dashboard", href: "/doctor/dashboard" },
      { label: "Consultas", href: "/doctor/consultas" },
      { label: "Nueva Consulta", href: "/doctor/consultas/nueva" },
      { label: "Laboratorio", href: "/doctor/laboratorio" },
    ],
  },
  {
    label: "Agenda",
    icon: icons.agenda,
    children: [
      { label: "Semana", href: "/agenda/semana" },
      { label: "Día", href: "/agenda/dia" },
    ],
  },
  {
    label: "Reportes",
    icon: icons.reportes,
    href: "/reportes",
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [openMenus, setOpenMenus] = useState({});
  const [minimized, setMinimized] = useState(false);

  const toggleMenu = label =>
    setOpenMenus(open => ({
      ...open,
      [label]: !open[label],
    }));

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside
      className={`flex flex-col min-h-screen bg-teal-600 text-white transition-all duration-300 ${
        minimized ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between px-3 py-4 border-b border-teal-800">
        <span className={`text-xl font-bold transition-all duration-200 ${minimized ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>
          {user?.name || "Usuario"}
        </span>
        <button
          className="p-2 rounded hover:bg-teal-700 transition-all"
          onClick={() => setMinimized(m => !m)}
          aria-label={minimized ? "Extender sidebar" : "Minimizar sidebar"}
        >
          <span
            className={`inline-block transition-transform ${
              minimized ? "rotate-180" : "rotate-0"
            }`}
          >
            ▶
          </span>
        </button>
      </div>
      <nav className="flex-1 px-2 py-4">
        {menu.map(section => (
          <div key={section.label} className="mb-2">
            <button
              className={`w-full flex items-center px-3 py-2 rounded hover:bg-teal-700 font-semibold focus:outline-none transition-all ${
                minimized ? "justify-center" : ""
              }`}
              onClick={() => section.children ? toggleMenu(section.label) : router.push(section.href)}
              aria-label={section.label}
            >
              {section.icon}
              {!minimized && <span className="ml-2">{section.label}</span>}
              {section.children && !minimized && (
                <span className="ml-auto">{openMenus[section.label] ? "▲" : "▼"}</span>
              )}
            </button>
            {section.children && openMenus[section.label] && !minimized && (
              <div className="pl-8 py-1">
                {section.children.map(item => (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.href)}
                    className={`block text-left w-full px-2 py-1 rounded hover:bg-teal-500 ${
                      pathname === item.href ? "bg-teal-700 font-bold" : ""
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            {!section.children && !minimized && (
              <button
                onClick={() => router.push(section.href)}
                className={`block text-left w-full px-3 py-2 rounded hover:bg-teal-700 ${
                  pathname === section.href ? "bg-teal-700 font-bold" : ""
                }`}
              >
                {section.label}
              </button>
            )}
          </div>
        ))}
      </nav>
      <div className={`px-6 py-4 border-t border-teal-800 flex flex-col items-start gap-2 transition-all duration-200 ${minimized ? "items-center px-2" : ""}`}>
        <button
          onClick={handleLogout}
          className={`w-full bg-teal-700 flex items-center gap-2 px-3 py-2 rounded hover:bg-teal-800 transition-all ${
            minimized ? "justify-center px-2" : ""
          }`}
        >
          <span className="text-lg">🧾</span>
          {!minimized && <span>Salir / Logout</span>}
        </button>
        {user && (
          <div className={`w-10 h-10 rounded-full bg-teal-900 flex items-center justify-center font-bold text-xl mt-2 transition-all duration-200 ${
            minimized ? "w-8 h-8 text-base" : ""
          }`}>
            {user.name?.[0]?.toUpperCase() || "?"}
          </div>
        )}
      </div>
    </aside>
  );
}