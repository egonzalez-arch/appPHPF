"use client";
import { useAuth } from "../context/AuthContext"

const menuByRole = {
  PATIENT: [
    { label: "Dashboard", href: "/patient/dashboard", icon: "🏠" },
    { label: "Appointments", href: "/patient/appointments", icon: "📅" },
    { label: "Records", href: "/patient/records", icon: "📄" },
    { label: "Consents", href: "/patient/consents", icon: "🔒" },
    { label: "Insurance", href: "/patient/insurance", icon: "💳" },
  ],
  DOCTOR: [
    { label: "Dashboard", href: "/doctor/dashboard", icon: "🏥" },
    { label: "Patients", href: "/doctor/patients", icon: "🧑‍⚕️" },
    { label: "Consultations", href: "/doctor/consultations/new", icon: "💊" },
    { label: "Labs", href: "/doctor/labs", icon: "🧪" },
  ],
  ADMIN: [
    { label: "Clinic Dashboard", href: "/clinic/dashboard", icon: "🏢" },
    { label: "Reports", href: "/clinic/reports", icon: "📊" },
  ],
  INSURER: [
    { label: "Dashboard", href: "/insurer/dashboard", icon: "✅" },
  ],
}

export default function Sidebar() {
  const { user } = useAuth()
  if (!user) return null
  const menu = menuByRole[user.role] || []
  return (
    <aside className="w-60 bg-muted flex flex-col py-6 px-2 border-r min-h-screen">
      <nav>
        <ul className="flex flex-col gap-2">
          {menu.map(item => (
            <li key={item.href}>
              <a
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-accent"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}