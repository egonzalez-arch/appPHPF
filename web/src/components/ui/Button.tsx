import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ variant='primary', loading, className, children, ...rest }) => {
  return (
    <button
      className={clsx('btn', `btn-${variant}`, className)}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? '...' : children}
    </button>
  );
};

export default Button;