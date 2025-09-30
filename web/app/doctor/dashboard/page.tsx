export default function DoctorDashboard() {
  return (
    <div>
      <div className="flex gap-4 mb-6">
        <button className="btn btn-primary flex items-center gap-2">
          <span>➕</span> Nuevo Paciente
        </button>
        <button className="btn btn-secondary flex items-center gap-2">
          <span>🛠️</span> Herramientas
        </button>
        <button className="btn btn-accent flex items-center gap-2">
          <span>🎁</span> Recomendar
        </button>
      </div>
      <div className="bg-muted rounded-lg p-8 flex flex-col items-center justify-center mb-6">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <span>ℹ️</span> No tienes pacientes aún... 
        </h2>
        <p>
          Te sugerimos colocar información de pacientes reales ya que colocar información de prueba puede afectar a tus estadísticas.
          Crea un nuevo paciente haciendo click en el botón.
        </p>
        <button className="btn btn-primary mt-4">Crear Nuevo Paciente</button>
      </div>
      <div className="mt-6">
        <h3 className="text-md mb-2">
          Antes de iniciar, te recomendamos ver el siguiente vídeo para que conozcas los beneficios de utilizar PHPF
        </h3>
        <div className="aspect-video max-w-lg mx-auto">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/VIDEO_ID"
            title="Tour Completo"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}