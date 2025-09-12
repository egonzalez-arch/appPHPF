"use client";
import { FaInfoCircle, FaUsers } from "react-icons/fa";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Central Info Card */}
      <div className="bg-white border rounded-lg p-8 flex flex-col items-center justify-center shadow-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3 text-teal-700">
          <FaInfoCircle size={28} /> 
          No tienes pacientes aún
        </h2>
        <p className="text-gray-700 mb-6 text-center max-w-md leading-relaxed">
          Te sugerimos colocar información de pacientes reales ya que colocar información de prueba puede afectar a tus estadísticas.
          <br />
          Crea un nuevo paciente haciendo click en el botón.
        </p>
        <button className="flex items-center gap-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg">
          <FaUsers size={20} />
          Crear Nuevo Paciente
        </button>
      </div>

      {/* YouTube Video Card */}
      <div className="w-full flex flex-col items-center">
        <h3 className="text-lg mb-6 font-semibold text-center text-gray-800 max-w-2xl">
          Antes de iniciar, te recomendamos ver el siguiente vídeo para que conozcas los beneficios de utilizar PHPF
        </h3>
        <div className="rounded-xl overflow-hidden shadow-lg max-w-2xl w-full bg-black">
          <iframe
            width="100%"
            height="400"
            src="https://www.youtube.com/embed/VIDEO_ID"
            title="Tour Completo"
            allowFullScreen
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}