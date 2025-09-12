"use client";
import { FaInfoCircle, FaUsers } from "react-icons/fa";

export default function DashboardPage() {
  return (
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
  );
}