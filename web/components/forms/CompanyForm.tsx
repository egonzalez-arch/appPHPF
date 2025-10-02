'use client';
import { useState, useEffect } from 'react';
import { CompanyEntity } from '@/lib/api/api.companies';

interface Props {
  mode: 'create' | 'edit';
  initialCompany?: CompanyEntity;
  submitting?: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function CompanyForm({
  mode,
  initialCompany,
  submitting,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (mode === 'edit' && initialCompany) {
      setForm({
        name: initialCompany.name || '',
        address: initialCompany.address || '',
        phone: initialCompany.phone || '',
        email: initialCompany.email || '',
      });
    }
  }, [mode, initialCompany]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload: any = {
      name: form.name,
      address: form.address,
      phone: form.phone || undefined,
      email: form.email || undefined,
    };
    onSubmit(payload);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="text-xl font-semibold">
        {mode === 'edit' ? 'Editar Empresa' : 'Nueva Empresa'}
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nombre"
          className="border px-3 py-2 rounded"
          required
        />
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Dirección"
          className="border px-3 py-2 rounded"
          required
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Teléfono"
          className="border px-3 py-2 rounded"
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          type="email"
          className="border px-3 py-2 rounded"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
          disabled={submitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {submitting ? 'Guardando...' : mode === 'edit' ? 'Guardar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}