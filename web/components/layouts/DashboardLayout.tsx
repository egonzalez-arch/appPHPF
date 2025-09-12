"use client";
import { ReactNode } from "react";
import { Sidebar } from "@/components/navigation/Sidebar";
import { Topbar } from "@/components/navigation/Topbar";
import { cn } from "@/lib/utils";

<<<<<<< HEAD
interface DashboardLayoutProps {
  children: ReactNode;
  withTopbar?: boolean;
  className?: string;
}
=======
const MENU_ITEMS = [
  { href: "/dashboard/patients", label: "Pacientes", icon: <FaUsers size={32} /> },
  { href: "/dashboard/doctors", label: "Doctores", icon: <FaUserMd size={32} /> },
  { href: "/dashboard/appointments", label: "Citas", icon: <FaCalendarAlt size={32} /> },
  { href: "/dashboard/records", label: "Expedientes", icon: <FaChartBar size={32} /> },
  { href: "/dashboard/reports", label: "Reportes", icon: <FaChartBar size={32} /> },
  { href: "/dashboard/users", label: "Usuarios", icon: <FaUser size={32} /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
>>>>>>> ecc07e423c84dae525a346d3c5554bf2dce1be25

export const DashboardLayout = ({
  children,
  withTopbar = true,
  className,
}: DashboardLayoutProps) => {
  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Sidebar />
      <div className="lg:pl-60 flex flex-col min-h-screen">
        {withTopbar && <Topbar />}
        <main
            className={cn(
              "flex-1 p-5 md:p-8 w-full max-w-7xl mx-auto",
              className
            )}
=======
    <div className={darkMode ? "dark bg-gray-50" : "bg-gray-50"}>
      <div className="flex min-h-screen">
        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Mobile Sidebar */}
            <aside className="relative bg-gray-900 text-white w-64 flex flex-col shadow-xl">
              {/* Logo/Header */}
              <div className="flex items-center justify-between px-6 py-6 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🩻</span>
                  <span className="text-xl font-bold tracking-tight">MediDash</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close mobile menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  ✕
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
                      collapsed={false}
                    />
                  ))}
                </div>
              </nav>
              
              {/* User info and logout */}
              <div className="mt-auto mb-4 px-3 border-t border-gray-700 pt-4">
                <div className="px-3 py-2 mb-3">
                  <p className="text-xs text-gray-400 mb-1">Conectado como:</p>
                  <p className="text-sm font-medium truncate">{userName}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 mb-2">
                  <div className="bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    {userInitial}
                  </div>
                  <span className="text-sm font-medium">{userName}</span>
                </div>
                <Button
                  className="w-full"
                  variant="secondary"
                  aria-label="Logout"
                  onClick={handleLogoutClick}
                >
                  Salir / Logout
                </Button>
              </div>
            </aside>
          </div>
        )}

        {/* Sidebar */}
        <aside
          className={`bg-gray-900 text-white flex flex-col transition-all duration-300 ${
            collapsed ? "w-20" : "w-72"
          } min-h-screen shadow-2xl hidden lg:flex`}
          aria-label="Sidebar"
        >
          {/* Logo/Header del sidebar */}
          <div className={`flex items-center ${collapsed ? "justify-center px-0 py-8" : "justify-between px-8 py-8"} border-b border-gray-700`}>
            {!collapsed && (
              <div className="flex items-center gap-4">
                <span className="text-3xl">🩻</span>
                <span className="text-2xl font-bold tracking-tight">
                  MediDash
                </span>
              </div>
            )}
            {collapsed && <span className="text-3xl">🩻</span>}
            <Button
              variant="ghost"
              size="icon"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((v) => !v)}
              className={`${collapsed ? "mx-auto mt-2" : ""} text-gray-300 hover:text-white hover:bg-gray-800 p-3 rounded-lg`}
            >
              {collapsed ? "›" : "‹"}
            </Button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 py-8">
            <div className="space-y-3 px-4">
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
          
          {/* Gift Button */}
          <div className="px-4 mb-6">
            <button className={`w-full flex items-center ${collapsed ? "justify-center px-3 py-4" : "justify-center gap-3 px-6 py-4"} bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-xl transition-all shadow-lg`}>
              <FaGift size={24} />
              {!collapsed && <span>Recomendar</span>}
            </button>
          </div>
          
          {/* Bottom section with user info and logout */}
          <div className="mt-auto mb-6 px-4 border-t border-gray-700 pt-6">
            {!collapsed && (
              <div className="px-4 py-3 mb-4 bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Conectado como:</p>
                <p className="text-sm font-medium truncate">{userName}</p>
              </div>
            )}
            <div className="flex items-center gap-3 px-4 py-3 mb-3 bg-gray-800 rounded-lg">
              <div className="bg-teal-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                {userInitial}
              </div>
              {!collapsed && <span className="text-sm font-medium">{userName}</span>}
            </div>
            <Button
              className={`w-full ${collapsed ? "px-3 py-3" : "px-4 py-3"} bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg`}
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
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Top row - Logo and User Actions (always visible) */}
              <div className="flex items-center justify-between w-full lg:w-auto">
                <div className="flex items-center gap-3">
                  {/* Mobile menu button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Toggle mobile menu"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden text-gray-600 hover:text-gray-900 mr-3 p-2"
                  >
                    ☰
                  </Button>
                  <span className="text-3xl">🩻</span>
                  <span className="text-2xl font-bold text-teal-700">MediDash</span>
                </div>
                
                {/* User Actions - always visible on right */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Toggle dark mode"
                    onClick={() => setDarkMode((d) => !d)}
                    className="text-gray-600 hover:text-gray-900 p-2 rounded-lg"
                  >
                    {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                  </Button>
                  
                  <div className="bg-teal-600 text-white rounded-full w-11 h-11 flex items-center justify-center font-bold text-lg cursor-pointer hover:bg-teal-700 transition-all shadow-lg">
                    {userInitial}
                  </div>
                </div>
              </div>

              {/* Bottom row - Action Buttons and Search (stacked on mobile) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:gap-6 w-full lg:w-auto">
                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button className="flex items-center gap-3 border-2 border-teal-700 bg-white text-teal-700 font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:bg-teal-50 hover:shadow-lg">
                    <FaUsers size={18} />
                    <span className="hidden sm:inline">Nuevo Paciente</span>
                    <span className="sm:hidden">Nuevo</span>
                  </button>
                  <button className="flex items-center gap-3 border-2 border-gray-300 bg-white text-gray-800 font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:bg-gray-50 hover:shadow-lg">
                    <FaTools size={18} />
                    <span className="hidden sm:inline">Herramientas</span>
                    <span className="sm:hidden">Tools</span>
                  </button>
                  <button className="flex items-center gap-3 border-2 border-yellow-400 bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:bg-yellow-300 hover:shadow-lg">
                    <FaGift size={18} />
                    <span className="hidden sm:inline">Recomendar</span>
                    <span className="sm:hidden">Rec</span>
                  </button>
                </div>

                {/* Patient Search */}
                <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 w-full sm:min-w-[280px] lg:min-w-[350px] shadow-sm hover:shadow-md transition-all">
                  <FaSearch className="text-gray-400 mr-3" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar paciente..."
                    className="outline-none border-none bg-transparent flex-1 text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-8 bg-white">
            {children}
          </main>
        </div>

        {/* Diálogo de confirmación */}
        <Dialog
          open={confirmOpen}
          title="¿Cerrar sesión?"
          onConfirm={handleConfirmLogout}
          onCancel={handleCancelLogout}
>>>>>>> ecc07e423c84dae525a346d3c5554bf2dce1be25
        >
          {children}
        </main>
      </div>
    </div>
  );
};