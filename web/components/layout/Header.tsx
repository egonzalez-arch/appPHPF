import React from 'react';

type Props = {
  className?: string;
  title?: string;
  rightSlot?: React.ReactNode;
};

export const Header: React.FC<Props> = ({ className, title, rightSlot }) => {
  return (
    <header className={className}>
      <div>{title}</div>
      <div>{rightSlot}</div>
    </header>
  );
};