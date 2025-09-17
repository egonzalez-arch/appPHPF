import React from 'react';

type Props = { className?: string; title?: string; right?: React.ReactNode };
export const Header: React.FC<Props> = ({ className, title, right }) => {
  // No cambiamos estilos: usa tus clases actuales con className
  return (
    <header className={className}>
      <div className="flex items-center justify-between">
        <h1>{title}</h1>
        <div>{right}</div>
      </div>
    </header>
  );
};
export default Header;