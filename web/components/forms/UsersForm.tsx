'use client';

import React from 'react';
import { UserEntity } from '@/lib/api/api.users';

export interface UsersFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<UserEntity>;
  submitting?: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  confirm: string;
}

export default function UsersForm({
  mode,
  initialValues,
  submitting = false,
  onSubmit,
  onCancel,
}: UsersFormProps) {
  const [form, setForm] = React.useState<FormState>(() => ({
    firstName: initialValues?.firstName || initialValues?.firstname || '',
    lastName: initialValues?.lastName || '',
    email: initialValues?.email || '',
    phone: initialValues?.phone || '',
    role: initialValues?.role || 'PATIENT',
    password: '',
    confirm: '',
  }));

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === 'create') {
      if (!form.password) {
        alert('La contraseña es obligatoria.');
        return;
      }
      if (form.password !== form.confirm) {
        alert('Las contraseñas no coinciden.');
        return;
      }
    } else {
      if (form.password && form.password.length < 6) {
        alert('La nueva contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (form.password && form.password !== form.confirm) {
        alert('Confirmación no coincide.');
        return;
      }
    }

    const payload: any = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      role: form.role,
    };
    if (mode === 'create') {
      payload.password = form.password;
    } else if (form.password) {
      payload.password = form.password;
    }
    onSubmit(payload);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
      noValidate
      autoComplete="off"
    >
      <h2 className="text-xl font-semibold">
        {mode === 'edit' ? 'Editar Usuario' : 'Nuevo Usuario'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col text-sm gap-1">
          Nombre
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className="border rounded px-2 py-1"
            required
          />
        </label>
        <label className="flex flex-col text-sm gap-1">
          Apellido
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className="border rounded px-2 py-1"
            required
          />
        </label>
        <label className="flex flex-col text-sm gap-1">
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="border rounded px-2 py-1"
            required
            disabled={mode === 'edit'}
          />
        </label>
        <label className="flex flex-col text-sm gap-1">
          Teléfono
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="border rounded px-2 py-1"
            placeholder="+52..."
          />
        </label>
        <label className="flex flex-col text-sm gap-1">
          Rol
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="border rounded px-2 py-1"
          >
            <option value="PATIENT">Paciente</option>
            <option value="DOCTOR">Doctor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>

        {mode === 'create' && (
          <>
            <label className="flex flex-col text-sm gap-1">
              Contraseña
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="border rounded px-2 py-1"
                required
                minLength={6}
              />
            </label>
            <label className="flex flex-col text-sm gap-1">
              Confirmar
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                className="border rounded px-2 py-1"
                required
                minLength={6}
              />
            </label>
          </>
        )}

        {mode === 'edit' && (
          <>
            <label className="flex flex-col text-sm gap-1 md:col-span-2">
              Nueva Contraseña (opcional)
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="border rounded px-2 py-1"
                placeholder="Dejar vacío para no cambiar"
                minLength={6}
              />
            </label>
            <label className="flex flex-col text-sm gap-1 md:col-span-2">
              Confirmar (si cambias contraseña)
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                className="border rounded px-2 py-1"
                placeholder="Repite contraseña"
                minLength={6}
              />
            </label>
          </>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
            onClick={onCancel}
          disabled={submitting}
          className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {submitting
            ? mode === 'edit'
              ? 'Guardando...'
              : 'Creando...'
            : mode === 'edit'
            ? 'Guardar Cambios'
            : 'Crear'}
        </button>
      </div>
    </form>
  );
}