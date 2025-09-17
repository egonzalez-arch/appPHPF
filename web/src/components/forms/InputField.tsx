'use client';
import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

type Props = {
  label: string;
  registration: UseFormRegisterReturn;
  type?: string;
  error?: FieldError;
  className?: string;
};

const InputField: React.FC<Props> = ({ label, registration, type = 'text', error, className }) => {
  return (
    <div className={className}>
      <label className="block mb-1">{label}</label>
      <input type={type} {...registration} className="w-full" />
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  );
};

export default InputField;