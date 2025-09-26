'use client';
import React, { useState } from 'react';
import { DoctorEntity } from '@/lib/api/api.doctors';

interface DoctorsFormProps {
  mode: 'create' | 'edit';
  initialDoctor?: Partial<DoctorEntity>;
  submitting?: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

interface CreateFormState {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirm: string;
  };
  doctor: {
    specialty: string;
    license: string;
    bio: string;
  };
}

interface EditFormState {
  doctor: {
    specialty: string;
    license: string;
    bio: string;
  };
}

export default function DoctorsForm({
  mode,
  initialDoctor,
  submitting = false,
  onSubmit,
  onCancel,
}: DoctorsFormProps) {
  const [createState, setCreateState] = useState<CreateFormState>(() => ({
    user: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirm: '',
    },
    doctor: {
      specialty: '',
      license: '',
      bio: '',
    },
  }));

  const [editState, setEditState] = useState<EditFormState>(() => ({
    doctor: {
      specialty: initialDoctor?.specialty || '',
      license: initialDoctor?.license || '',
      bio: initialDoctor?.bio || '',
    },
  }));

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    if (mode === 'create') {
      if (name.startsWith('user.')) {
        const key = name.split('.')[1] as keyof CreateFormState['user'];
        setCreateState((s) => ({
          ...s,
            user: { ...s.user, [key]: value },
        }));
      } else if (name.startsWith('doctor.')) {
        const key = name.split('.')[1] as keyof CreateFormState['doctor'];
        setCreateState((s) => ({
          ...s,
          doctor: { ...s.doctor, [key]: value },
        }));
      }
    } else {
      if (name.startsWith('doctor.')) {
        const key = name.split('.')[1] as keyof EditFormState['doctor'];
        setEditState((s) => ({
          ...s,
          doctor: { ...s.doctor, [key]: value },
        }));
      }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === 'create') {
      if (!createState.user.firstName || !createState.user.lastName) {
        alert('Nombre y apellido son obligatorios.');
        return;
      }
      if (!createState.user.email) {
        alert('Email es obligatorio.');
        return;
      }
      if (!createState.user.password) {
        alert('Contraseña obligatoria.');
        return;
      }
      if (createState.user.password !== createState.user.confirm) {
        alert('Las contraseñas no coinciden.');
        return;
      }
      if (!createState.doctor.specialty || !createState.doctor.license) {
        alert('Especialidad y licencia son obligatorias.');
        return;
      }
      onSubmit({
        user: {
          firstName: createState.user.firstName.trim(),
          lastName: createState.user.lastName.trim(),
          email: createState.user.email.trim().toLowerCase(),
          phone: createState.user.phone.trim() || undefined,
          password: createState.user.password,
        },
        doctor: {
          specialty: createState.doctor.specialty.trim(),
          license: createState.doctor.license.trim(),
          bio: createState.doctor.bio.trim() || undefined,
        },
      });
    } else {
      onSubmit({
        specialty: editState.doctor.specialty.trim(),
        license: editState.doctor.license.trim(),
        bio: editState.doctor.bio.trim() || undefined,
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
      noValidate
      autoComplete="off"
    >
      <h2 className="text-xl font-semibold">
        {mode === 'edit' ? 'Editar Doctor' : 'Nuevo Doctor'}
      </h2>

      {mode === 'create' && (
        <fieldset className="border rounded p-4 space-y-4">
          <legend className="text-sm font-medium">Datos del Usuario</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col text-sm gap-1">
              Nombre
              <input
                name="user.firstName"
                value={createState.user.firstName}
                onChange={handleChange}
                className="border rounded px-2 py-1"
                required
              />
            </label>
            <label className="flex flex-col text-sm gap-1">
              Apellido
              <input
                name="user.lastName"
                value={createState.user.lastName}
                onChange={handleChange}
                className="border rounded px-2 py-1"
                required
              />
            </label>
            <label className="flex flex-col text-sm gap-1">
              Email
              <input
                type="email"
                name="user.email"
                value={createState.user.email}
                onChange={handleChange}
                className="border rounded px-2 py-1"
                required
              />
            </label>
            <label className="flex flex-col text-sm gap-1">
              Teléfono
              <input
                name="user.phone"
                value={createState.user.phone}
                onChange={handleChange}
                className="border rounded px-2 py-1"
                placeholder="+52..."
              />
            </label>
            <label className="flex flex-col text-sm gap-1">
              Contraseña
              <input
                type="password"
                name="user.password"
                value={createState.user.password}
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
                name="user.confirm"
                value={createState.user.confirm}
                onChange={handleChange}
                className="border rounded px-2 py-1"
                required
                minLength={6}
              />
            </label>
          </div>
        </fieldset>
      )}

      <fieldset className="border rounded p-4 space-y-4">
        <legend className="text-sm font-medium">Datos del Doctor</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col text-sm gap-1">
            Especialidad
            <input
              name="doctor.specialty"
              value={
                mode === 'create'
                  ? createState.doctor.specialty
                  : editState.doctor.specialty
              }
              onChange={handleChange}
              className="border rounded px-2 py-1"
              required
            />
          </label>
          <label className="flex flex-col text-sm gap-1">
            Licencia
            <input
              name="doctor.license"
              value={
                mode === 'create'
                  ? createState.doctor.license
                  : editState.doctor.license
              }
              onChange={handleChange}
              className="border rounded px-2 py-1"
              required
            />
          </label>
          <label className="flex flex-col text-sm gap-1 md:col-span-2">
            Bio
            <textarea
              name="doctor.bio"
              value={
                mode === 'create'
                  ? createState.doctor.bio
                  : editState.doctor.bio
              }
              onChange={handleChange}
              className="border rounded px-2 py-1 h-24 resize-y"
              placeholder="Experiencia, estudios, etc."
            />
          </label>
        </div>
      </fieldset>

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