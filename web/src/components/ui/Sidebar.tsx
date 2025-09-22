import React from 'react';
import Link from 'next/link';

/**
 * Sidebar mínima. Reutiliza las clases actuales (ajusta className según tu CSS).
 * No altera paleta ni estilos, sólo organiza estructura.
 */
const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {/* Ajusta enlaces a los que ya existan en tu app */}
          <li><Link href="/dashboard">Dashboard</Link></li>
          <li><Link href="/patients">Pacientes</Link></li>
          <li><Link href="/appointments">Citas</Link></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;