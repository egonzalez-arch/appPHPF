"use client";
import { FaBars } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

interface TopbarProps {
  onMenu: () => void;
}

export function Topbar({ onMenu }: TopbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 flex items-center gap-4 px-4 sm:px-6 lg:px-10 border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur">
      <button
        onClick={onMenu}
        className="lg:hidden p-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Menu"
      >
        <FaBars />
      </button>
      <div className="flex-1 font-semibold text-sm sm:text-base">Dashboard</div>
      <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        <span>{user?.email}</span>
        <button
          onClick={logout}
          className="px-3 py-1 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700"
        >
          Salir
        </button>
      </div>
    </header>
  );
}