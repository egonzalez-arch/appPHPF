import React from 'react';

type Props = { className?: string; children?: React.ReactNode };
export const Sidebar: React.FC<Props> = ({ className, children }) => {
  // Renderiza tu menú actual dentro de este contenedor
  return <aside className={className}>{children}</aside>;
};
export default Sidebar;