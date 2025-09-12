"use client";
import { FaUsers, FaUserMd, FaCalendarAlt, FaChartBar, FaSignOutAlt, FaGift, FaTools, FaSearch, FaInfoCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Simulando la inicial del usuario para el círculo de avatar
  const userInitial = user?.name?.[0]?.toUpperCase() || "N";

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="bg-teal-700 text-white w-64 flex flex-col py-8 px-6">
        <h1 className="text-2xl font-bold mb-10 tracking-tight">MediDash</h1>
        <nav className="flex flex-col gap-3 flex-1">
          <a className="flex items-center gap-3 py-2 px-4 rounded hover:bg-teal-800 transition font-bold" href="#">
            <FaUsers size={22} />
            Pacientes
          </a>
          <a className="flex items-center gap-3 py-2 px-4 rounded hover:bg-teal-800 transition font-bold" href="#">
            <FaUserMd size={22} />
            Doctor
          </a>
          <a className="flex items-center gap-3 py-2 px-4 rounded hover:bg-teal-800 transition font-bold" href="#">
            <FaCalendarAlt size={22} />
            Agenda
          </a>
          <a className="flex items-center gap-3 py-2 px-4 rounded hover:bg-teal-800 transition font-bold" href="#">
            <FaChartBar size={22} />
            Reportes
          </a>
        </nav>
        <div className="mt-auto">
          <button
            className="flex items-center gap-2 w-full py-2 px-4 rounded bg-teal-600 hover:bg-teal-800 transition font-semibold"
            onClick={logout}
          >
            <FaSignOutAlt size={20} />
            Salir / Logout
          </button>
          <div className="mt-8 text-xs text-teal-200 text-center">©2025 MediDash</div>
          <div className="flex justify-center mt-4">
            <span className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">
              {userInitial}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-10 py-8">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <button className="flex items-center gap-2 border-2 border-teal-700 bg-white text-teal-700 font-semibold px-5 py-2 rounded transition shadow hover:bg-teal-50">
            <FaUsers />
            Nuevo Paciente
          </button>
          <button className="flex items-center gap-2 border-2 border-gray-300 bg-white text-gray-800 font-semibold px-5 py-2 rounded transition shadow hover:bg-gray-100">
            <FaTools />
            Herramientas
          </button>
          <button className="flex items-center gap-2 border-2 border-yellow-400 bg-yellow-400 text-gray-900 font-semibold px-5 py-2 rounded transition shadow hover:bg-yellow-300">
            <FaGift />
            Recomendar
          </button>
          <div className="flex items-center ml-auto bg-white rounded px-3 py-2 shadow border">
            <span className="mr-2 font-semibold text-gray-700">Buscar paciente</span>
            <input
              type="text"
              placeholder="Escribe nombre o teléfono de su paciente"
              className="outline-none border-none text-sm bg-transparent"
            />
            <FaSearch className="ml-2 text-teal-600" />
          </div>
        </div>

        {/* Central Info Card */}
        <div className="bg-white border rounded-lg p-8 flex flex-col items-center justify-center shadow mb-8">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-teal-700">
            <FaInfoCircle size={24} /> No tienes pacientes aún
          </h2>
          <p className="text-gray-700 mb-4 text-center">
            Te sugerimos colocar información de pacientes reales ya que colocar información de prueba puede afectar a tus estadísticas.<br />
            Crea un nuevo paciente haciendo click en el botón.
          </p>
          <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2 rounded transition shadow">
            <FaUsers />
            Crear Nuevo Paciente
          </button>
        </div>

        {/* YouTube Video Card */}
        <div className="w-full flex flex-col items-center">
          <h3 className="text-md mb-4 font-semibold text-center">
            Antes de iniciar, te recomendamos ver el siguiente vídeo para que conozcas los beneficios de utilizar PHPF
          </h3>
          <div className="rounded-lg overflow-hidden shadow-lg max-w-md w-full bg-black flex justify-center items-center">
            <iframe
              width="100%"
              height="315"
              src="https://www.youtube.com/embed/VIDEO_ID"
              title="Tour Completo"
              allowFullScreen
            />
          </div>
        </div>
      </main>
    </div>
  );
}