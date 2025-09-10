"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { 
  FaUsers, 
  FaUserMd, 
  FaCalendarAlt, 
  FaChartBar, 
  FaSignOutAlt 
} from "react-icons/fa";

const menuItems = [
  {
    label: "Pacientes",
    icon: <FaUsers className="w-5 h-5" />,
    href: "/dashboard/patients"
  },
  {
    label: "Doctor",
    icon: <FaUserMd className="w-5 h-5" />,
    href: "/dashboard/doctor"
  },
  {
    label: "Agenda",
    icon: <FaCalendarAlt className="w-5 h-5" />,
    href: "/dashboard/agenda"
  },
  {
    label: "Reportes",
    icon: <FaChartBar className="w-5 h-5" />,
    href: "/dashboard/reports"
  }
];

export default function Sidebar() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    router.replace("/login");
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <aside className="w-64 bg-teal-600 min-h-screen flex flex-col text-white shadow-xl" style={{backgroundColor: '#009688'}}>
      {/* Logo */}
      <div className="p-6 border-b border-teal-500">
        <h1 className="text-2xl font-bold text-white">MediDash</h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => (
            <li key={item.label}>
              <button
                onClick={() => handleNavigation(item.href)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-teal-500 transition-colors duration-200"
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-teal-500">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-red-600 transition-colors duration-200"
        >
          <FaSignOutAlt className="w-5 h-5" />
          <span className="font-medium">Salir</span>
        </button>
      </div>
    </aside>
  );
}