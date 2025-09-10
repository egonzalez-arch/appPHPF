"use client";
import { 
  FaPlus, 
  FaTools, 
  FaThumbsUp, 
  FaSearch, 
  FaInfoCircle 
} from "react-icons/fa";

export default function DashboardContent() {
  const handleNewPatient = () => {
    // TODO: Navigate to new patient form
    console.log("Nuevo Paciente clicked");
  };

  const handleTools = () => {
    // TODO: Open tools menu
    console.log("Herramientas clicked");
  };

  const handleRecommend = () => {
    // TODO: Open recommend feature
    console.log("Recomendar clicked");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search
    console.log("Search patients");
  };

  const handleCreatePatient = () => {
    // TODO: Navigate to patient creation
    console.log("Crear Nuevo Paciente clicked");
  };

  return (
    <main className="flex-1 flex flex-col bg-gray-50">
      {/* Top Action Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Nuevo Paciente - Green */}
            <button
              onClick={handleNewPatient}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <FaPlus className="w-4 h-4" />
              <span className="font-medium">Nuevo Paciente</span>
            </button>

            {/* Herramientas - Gray */}
            <button
              onClick={handleTools}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <FaTools className="w-4 h-4" />
              <span className="font-medium">Herramientas</span>
            </button>

            {/* Recomendar - Yellow */}
            <button
              onClick={handleRecommend}
              className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <FaThumbsUp className="w-4 h-4" />
              <span className="font-medium">Recomendar</span>
            </button>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar pacientes..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 space-y-6">
        {/* Info Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <FaInfoCircle className="w-20 h-20 text-teal-600" />
            <h2 className="text-3xl font-bold text-gray-800">
              No tienes pacientes aún
            </h2>
            <p className="text-gray-600 max-w-lg text-lg">
              Comienza agregando tu primer paciente para gestionar sus historiales médicos, 
              citas y seguimiento de manera eficiente.
            </p>
            <button
              onClick={handleCreatePatient}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors duration-200"
            >
              Crear Nuevo Paciente
            </button>
          </div>
        </div>

        {/* YouTube Video Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Antes de iniciar, te recomendamos ver el siguiente vídeo para que conozcas los beneficios de utilizar PHPF
            </h3>
            <div className="flex justify-center">
              <div className="w-full max-w-2xl bg-gray-100 rounded-lg overflow-hidden">
                {/* YouTube Video Placeholder */}
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-2 bg-red-600 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <p>Video de YouTube</p>
                    <p className="text-sm">Tour Completo - PHPF</p>
                  </div>
                </div>
                {/* For actual implementation, replace with:
                <iframe
                  width="100%"
                  height="315"
                  src="https://www.youtube.com/embed/VIDEO_ID"
                  title="Tour Completo - PHPF"
                  frameBorder="0"
                  allowFullScreen
                  className="w-full aspect-video"
                />
                */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}