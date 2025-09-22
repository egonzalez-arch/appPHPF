import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input: React.FC<InputProps> = ({ error, className, ...rest }) => {
  return (
    <div className="input-wrapper">
      <input className={clsx('input', { error: !!error }, className)} {...rest} />
      {error && <small className="error-text">{error}</small>}
    </div>
  );
};

export default Input;