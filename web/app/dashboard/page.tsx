
"use client";
import { FaInfoCircle, FaUsers } from "react-icons/fa";

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-10 md:p-14 flex flex-col items-center text-center shadow-sm">
        <div className="mb-6">
          <FaInfoCircle size={56} className="text-blue-500 mx-auto" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          No tienes pacientes aún .
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl leading-relaxed text-base md:text-lg">
          Te sugerimos colocar información de pacientes reales ya que colocar información de prueba puede afectar a tus estadísticas.
          <br />
          <span className="font-semibold">
            Crea un nuevo paciente haciendo click en el botón.
          </span>
        </p>
        <button className="flex items-center gap-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow hover:shadow-md text-base md:text-lg">
          <FaUsers size={22} />
          Crear Nuevo Paciente
        </button>
      </div>

      <section>
        <h3 className="text-xl md:text-2xl font-bold mb-6 text-center">
          Antes de iniciar, te recomendamos ver el siguiente vídeo para que conozcas los beneficios de utilizar PHPF
        </h3>
        <div className="rounded-2xl overflow-hidden shadow-lg bg-black ring-4 ring-gray-900/5 dark:ring-gray-50/5">
          <iframe
            width="100%"
            height="480"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="Tour Completo de PHPF"
            allowFullScreen
            className="w-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </section>
    </div>
  );
}