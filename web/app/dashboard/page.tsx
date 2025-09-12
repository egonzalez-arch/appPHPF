// Imagen 1 (antes): página plana, sin sidebar ni header, todo el contenido centrado verticalmente y ocupando toda la pantalla.
// Imagen 2 (después): dashboard con sidebar izquierda fija, header opcional, y área de contenido principal a la derecha, responsivo, con dark mode.
// 📝 OBJECTIVE
// Refactor this Next.js frontend code so that the UI currently displayed like in "Imagen 1"
// becomes visually like "Imagen 2", maintaining the same design system (colors, fonts, and spacing) used in the project.
//
// 🖼️ CURRENT STATE (Imagen 1)
// - Flat page layout without sidebar
// - All content stacked vertically
//
// 🖼️ DESIRED STATE (Imagen 2)
// - Modern dashboard layout with:
//    - A persistent sidebar on the left (visible on all internal pages)
//    - A topbar/header for user info and actions (optional)
//    - The main content on the right, scrollable
// - Sidebar must contain navigation links to the existing pages
// - Highlight the active page in the sidebar
//
// 🎨 DESIGN RULES
// - Preserve the existing color palette, typography, shadows, and spacing
// - Maintain responsive design (sidebar collapsible on mobile)
// - Keep using TailwindCSS and any current UI libraries (like shadcn/ui)
// - Dark mode support must continue working
//
// ⚙️ TECHNICAL DETAILS
// - Next.js + TypeScript project
// - Create a shared layout component (e.g. components/layouts/DashboardLayout.tsx)
// - Wrap all dashboard pages with this layout
// - Do NOT apply sidebar on /login or /register pages
//
// 🚀 DELIVERABLE
// - Refactor the code so that all dashboard pages use the new sidebar layout
// - Sidebar should be reusable and easy to add new links
// - Keep existing backend API calls intact
//
// Please modify this repository accordingly.


"use client";
import { FaInfoCircle, FaUsers } from "react-icons/fa";

export default function DashboardPage() {
  return (
<<<<<<< HEAD
    <div className="space-y-10">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-10 md:p-14 flex flex-col items-center text-center shadow-sm">
        <div className="mb-6">
          <FaInfoCircle size={56} className="text-blue-500 mx-auto" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          No tienes pacientes aún
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl leading-relaxed text-base md:text-lg">
=======
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
>>>>>>> ecc07e423c84dae525a346d3c5554bf2dce1be25
          Te sugerimos colocar información de pacientes reales ya que colocar información de prueba puede afectar a tus estadísticas.
          <br />
          <span className="font-semibold">Crea un nuevo paciente haciendo click en el botón.</span>
        </p>
<<<<<<< HEAD
        <button className="flex items-center gap-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow hover:shadow-md text-base md:text-lg">
          <FaUsers size={22} />
=======
        <button className="flex items-center gap-4 bg-green-600 hover:bg-green-700 text-white font-bold px-12 py-5 rounded-2xl transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 text-lg">
          <FaUsers size={28} />
>>>>>>> ecc07e423c84dae525a346d3c5554bf2dce1be25
          Crear Nuevo Paciente
        </button>
      </div>

<<<<<<< HEAD
      <section>
        <h3 className="text-xl md:text-2xl font-bold mb-6 text-center">
          Antes de iniciar, te recomendamos ver el siguiente vídeo para que conozcas los beneficios de utilizar PHPF
        </h3>
        <div className="rounded-2xl overflow-hidden shadow-lg bg-black ring-4 ring-gray-900/5 dark:ring-gray-50/5">
          <iframe
            width="100%"
            height="480"
=======
      {/* YouTube Video Card */}
      <div className="w-full flex flex-col items-center">
        <h3 className="text-2xl mb-10 font-bold text-center text-gray-900 max-w-4xl leading-relaxed">
          Antes de iniciar, te recomendamos ver el siguiente vídeo para que conozcas los beneficios de utilizar PHPF
        </h3>
        <div className="rounded-3xl overflow-hidden shadow-2xl max-w-5xl w-full bg-black ring-8 ring-gray-900/10">
          <iframe
            width="100%"
            height="500"
>>>>>>> ecc07e423c84dae525a346d3c5554bf2dce1be25
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