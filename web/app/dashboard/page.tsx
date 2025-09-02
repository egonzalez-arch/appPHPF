"use client";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <main className="flex-1 flex flex-col gap-6 px-8 py-8">
      {/* Barra superior de acciones */}
      <div className="flex items-center gap-3 py-2 px-4 bg-white rounded-t-lg shadow border border-b-0">
        {/* ... tus botones y el buscador ... */}
      </div>

      {/* Card central de información */}
      <div className="bg-white border rounded-lg p-8 flex flex-col items-center justify-center shadow">
        {/* ... tu mensaje de bienvenida ... */}
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
    </main>
  );
}