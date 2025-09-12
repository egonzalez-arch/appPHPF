"use client";
import { FaInfoCircle, FaUsers } from "react-icons/fa";

export default function DashboardPage() {
  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* Central Info Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-16 flex flex-col items-center justify-center shadow-xl hover:shadow-2xl transition-all">
        <div className="mb-8">
          <FaInfoCircle size={64} className="text-blue-500 mx-auto" />
        </div>
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
          No tienes pacientes aún
        </h2>
        <p className="text-gray-600 mb-10 text-center max-w-2xl leading-relaxed text-xl">
          Te sugerimos colocar información de pacientes reales ya que colocar información de prueba puede afectar a tus estadísticas.
          <br />
          <span className="font-semibold">Crea un nuevo paciente haciendo click en el botón.</span>
        </p>
        <button className="flex items-center gap-4 bg-green-600 hover:bg-green-700 text-white font-bold px-12 py-5 rounded-2xl transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 text-lg">
          <FaUsers size={28} />
          Crear Nuevo Paciente
        </button>
      </div>

      {/* YouTube Video Card */}
      <div className="w-full flex flex-col items-center">
        <h3 className="text-2xl mb-10 font-bold text-center text-gray-900 max-w-4xl leading-relaxed">
          Antes de iniciar, te recomendamos ver el siguiente vídeo para que conozcas los beneficios de utilizar PHPF
        </h3>
        <div className="rounded-3xl overflow-hidden shadow-2xl max-w-5xl w-full bg-black ring-8 ring-gray-900/10">
          <iframe
            width="100%"
            height="500"
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