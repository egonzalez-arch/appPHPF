"use client";
import { FaInfoCircle, FaUsers, FaUserMd, FaCalendarAlt, FaChartBar, FaTools, FaGift, FaSearch, FaUser } from "react-icons/fa";
import { useState } from "react";

export default function DashboardPreviewPage() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-gray-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`bg-gray-900 text-white flex flex-col transition-all duration-300 ${
            collapsed ? "w-20" : "w-72"
          } min-h-screen shadow-2xl`}
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
            <button
              onClick={() => setCollapsed((v) => !v)}
              className={`${collapsed ? "mx-auto mt-2" : ""} text-gray-300 hover:text-white hover:bg-gray-800 p-3 rounded-lg`}
            >
              {collapsed ? "›" : "‹"}
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 py-8">
            <div className="space-y-3 px-4">
              {[
                { label: "Pacientes", icon: <FaUsers size={32} /> },
                { label: "Doctores", icon: <FaUserMd size={32} /> },
                { label: "Citas", icon: <FaCalendarAlt size={32} /> },
                { label: "Expedientes", icon: <FaChartBar size={32} /> },
                { label: "Reportes", icon: <FaChartBar size={32} /> },
                { label: "Usuarios", icon: <FaUser size={32} /> },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center ${collapsed ? "justify-center px-3 py-4" : "gap-4 px-4 py-4"} mx-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 cursor-pointer`}
                >
                  {item.icon}
                  {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
                </div>
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
          
          {/* Bottom section with user info */}
          <div className="mt-auto mb-6 px-4 border-t border-gray-700 pt-6">
            {!collapsed && (
              <div className="px-4 py-3 mb-4 bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Conectado como:</p>
                <p className="text-sm font-medium truncate">Usuario</p>
              </div>
            )}
            <div className="flex items-center gap-3 px-4 py-3 mb-3 bg-gray-800 rounded-lg">
              <div className="bg-teal-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                U
              </div>
              {!collapsed && <span className="text-sm font-medium">Usuario</span>}
            </div>
            <button className={`w-full ${collapsed ? "px-3 py-3" : "px-4 py-3"} bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg`}>
              {collapsed ? "↪" : "Salir / Logout"}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Top row - Logo and User Actions */}
              <div className="flex items-center justify-between w-full lg:w-auto">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🩻</span>
                  <span className="text-2xl font-bold text-teal-700">MediDash</span>
                </div>
                
                {/* User Actions */}
                <div className="flex items-center gap-4">
                  <button className="text-gray-600 hover:text-gray-900 p-2 rounded-lg">
                    🌙
                  </button>
                  
                  <div className="bg-teal-600 text-white rounded-full w-11 h-11 flex items-center justify-center font-bold text-lg cursor-pointer hover:bg-teal-700 transition-all shadow-lg">
                    U
                  </div>
                </div>
              </div>

              {/* Bottom row - Action Buttons and Search */}
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
            <div className="space-y-8">
              {/* Central Info Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center shadow-lg">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-4 text-gray-800">
                  <FaInfoCircle size={48} className="text-blue-500" /> 
                  No tienes pacientes aún
                </h2>
                <p className="text-gray-600 mb-8 text-center max-w-lg leading-relaxed text-lg">
                  Te sugerimos colocar información de pacientes reales ya que colocar información de prueba puede afectar a tus estadísticas.
                  <br />
                  Crea un nuevo paciente haciendo click en el botón.
                </p>
                <button className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                  <FaUsers size={24} />
                  Crear Nuevo Paciente
                </button>
              </div>

              {/* YouTube Video Card */}
              <div className="w-full flex flex-col items-center">
                <h3 className="text-xl mb-8 font-semibold text-center text-gray-800 max-w-3xl leading-relaxed">
                  Antes de iniciar, te recomendamos ver el siguiente vídeo para que conozcas los beneficios de utilizar PHPF
                </h3>
                <div className="rounded-2xl overflow-hidden shadow-2xl max-w-4xl w-full bg-black">
                  <iframe
                    width="100%"
                    height="450"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="Tour Completo de PHPF"
                    allowFullScreen
                    className="w-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}