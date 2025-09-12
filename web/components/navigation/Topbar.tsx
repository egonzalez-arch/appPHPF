"use client";
import { Bell, LogOut, Search } from "lucide-react";

export const Topbar = () => {
  return (
    <header className="h-14 sticky top-0 z-30 flex items-center gap-4 border-b bg-white/80 backdrop-blur dark:bg-gray-900/80 dark:border-gray-800 px-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          placeholder="Buscar..."
          className="w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        />
      </div>
      <button className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
        <Bell className="h-4 w-4" />
      </button>
      <button className="h-9 inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700">
        <LogOut className="h-4 w-4" />
        <span className="hidden md:inline">Salir</span>
      </button>
    </header>
  );
};