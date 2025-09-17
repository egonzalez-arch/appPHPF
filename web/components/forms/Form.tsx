"use client";
import { ReactNode } from 'react';

// Helper component for form fields
interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
}

export function FormField({ label, error, children, required = false }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

// Styled input component
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function FormInput({ error, className = '', ...props }: FormInputProps) {
  return (
    <input
      className={`
        w-full px-3 py-2 border rounded-md shadow-sm
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        dark:bg-gray-800 dark:border-gray-600 dark:text-white
        ${error 
          ? 'border-red-300 focus:ring-red-500' 
          : 'border-gray-300 dark:border-gray-600'
        }
        ${className}
      `}
      {...props}
    />
  );
}

// Styled textarea component
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function FormTextarea({ error, className = '', ...props }: FormTextareaProps) {
  return (
    <textarea
      className={`
        w-full px-3 py-2 border rounded-md shadow-sm
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        dark:bg-gray-800 dark:border-gray-600 dark:text-white
        resize-none
        ${error 
          ? 'border-red-300 focus:ring-red-500' 
          : 'border-gray-300 dark:border-gray-600'
        }
        ${className}
      `}
      {...props}
    />
  );
}

// Styled select component
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string }[];
}

export function FormSelect({ error, options, className = '', ...props }: FormSelectProps) {
  return (
    <select
      className={`
        w-full px-3 py-2 border rounded-md shadow-sm
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        dark:bg-gray-800 dark:border-gray-600 dark:text-white
        ${error 
          ? 'border-red-300 focus:ring-red-500' 
          : 'border-gray-300 dark:border-gray-600'
        }
        ${className}
      `}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}