"use client";
export default function DoctorDashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* Barra superior de acciones */}
      <div className="flex items-center gap-3 py-2 px-4 bg-white rounded-t-lg shadow border border-b-0">
        <button className="flex items-center gap-1 bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700 transition shadow">
          <span>➕</span> Nuevo Paciente
        </button>
        <div className="relative group">
          <button className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded border hover:bg-gray-200 transition shadow">
            <span>🛠️</span> Herramientas <span>▼</span>
          </button>
          {/* Menú desplegable aquí si lo necesitas */}
        </div>
        <button className="flex items-center gap-1 bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition shadow">
          <span>🎁</span> Recomendar
        </button>
        <div className="flex-1" />
        {/* Buscador de pacientes */}
        <form className="flex items-center gap-2">
          <label htmlFor="busqueda" className="text-gray-700 font-semibold">
            Buscar paciente
          </label>
          <input
            id="busqueda"
            type="text"
            placeholder="Escribe nombre o teléfono de su paciente"
            className="border rounded px-2 py-1 outline-none min-w-[240px] text-gray-700"
          />
          <button className="bg-teal-600 text-white px-2 py-1 rounded hover:bg-teal-700 transition shadow">
            🔍
          </button>
        </form>
      </div>

      {/* Card central de información */}
      <div className="bg-white border rounded-lg p-8 flex flex-col items-center justify-center shadow">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-teal-600 text-3xl">ℹ️</span>
          <h2 className="text-xl font-semibold">No tienes pacientes aún</h2>
        </div>
        <p className="text-gray-600 mb-2 text-center max-w-xl">
          Te sugerimos colocar información de pacientes reales ya que colocar información de prueba puede afectar a tus estadísticas. 
          <br />
          Crea un nuevo paciente haciendo click en el botón.
        </p>
        <button className="bg-teal-600 text-white px-4 py-2 rounded shadow hover:bg-teal-700 transition mt-2">
          ➕ Crear Nuevo Paciente
        </button>
      </div>

      {/* Video YouTube */}
      <div className="mt-2 w-full flex flex-col items-center">
        <h3 className="text-md mb-2 font-semibold text-center">
          Antes de iniciar, te recomendamos ver el siguiente vídeo para que conozcas los beneficios de utilizar PHPF
        </h3>
        <div className="rounded-lg overflow-hidden shadow-lg max-w-md w-full">
          <iframe
            width="100%"
            height="315"
            src="https://www.youtube.com/embed/VIDEO_ID"
            title="Tour Completo"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}