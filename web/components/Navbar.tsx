"use client";
import { useAuth } from "../context/AuthContext"
import DarkModeToggle from "./DarkModeToggle"

export default function Navbar() {
  const { user } = useAuth()
  return (
    <nav className="flex items-center justify-between px-4 py-2 bg-primary text-white">
      <div className="flex items-center gap-2">
        <img src="/logo.svg" alt="Logo" className="h-8" />
        <span className="font-bold">PHPF</span>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <span>
            {user.role === "DOCTOR"
              ? `Dr. ${user.lastName}`
              : user.role === "PATIENT"
              ? user.firstName
              : user.email}
          </span>
        )}
        <DarkModeToggle />
      </div>
    </nav>
  )
}