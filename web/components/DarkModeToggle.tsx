'use client';
import { useState, useEffect } from "react";
export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="px-3 py-1 rounded bg-zinc-800 text-white"
    >
      {dark ? "☀️ Claro" : "🌙 Oscuro"}
    </button>
  );
}