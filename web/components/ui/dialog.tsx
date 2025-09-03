import { ReactNode } from "react";

interface DialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function Dialog({ open, title, children, onConfirm, onCancel }: DialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
        <h2 id="dialog-title" className="text-lg font-semibold mb-2">{title}</h2>
        <div className="mb-4">{children}</div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            onClick={onCancel}
            aria-label="Cancelar"
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 text-white bg-teal-600 rounded hover:bg-teal-700"
            onClick={onConfirm}
            aria-label="Confirmar"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}