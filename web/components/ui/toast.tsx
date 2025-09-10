import {  useEffect } from "react";

interface ToastProps {
  open: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ open, message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed top-6 right-6 z-50 bg-teal-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}