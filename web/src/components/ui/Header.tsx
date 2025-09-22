import React from 'react';
import { useAuth } from '../../hooks/useAuth';

/**
 * Header persistente.
 * Usa las clases ya existentes (ajusta className).
 */
const Header: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <header className="header-bar">
      <div className="header-left">
        <span className="app-title">Aplicación</span>
      </div>
      <div className="header-right">
        {user && (
          <>
            <span className="user-email">{user.email}</span>
            <button onClick={logout} className="logout-btn">Salir</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;