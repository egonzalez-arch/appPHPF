import React from 'react';
import { Patient } from '@/lib/api/api';

interface PatientFormProps {
  initialValues?: Partial<
    Patient & {
      allergies?: string[] | string;
      emergencyContact?: any;
    }
  >;
  mode?: 'create' | 'edit';
  submitting?: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

interface ECState { name: string; relation: string; phone: string; }
interface UserState { firstName: string; lastName: string; email: string; phone: string; password: string; confirm: string; }

function formatDateToInput(value?: string | Date | null): string {
  if (!value) return '';
  try {
    const d = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(d.getTime())) return '';
    return d.toISOString().substring(0, 10);
  } catch { return ''; }
}

function adaptEmergencyContact(raw: any): ECState {
  if (!raw) return { name: '', relation: '', phone: '' };
  if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch { return { name: '', relation: '', phone: '' }; } }
  if (typeof raw !== 'object' || Array.isArray(raw)) return { name: '', relation: '', phone: '' };
  const name = raw.name ?? raw.Name ?? raw.nombre ?? raw.Nombre ?? raw.fullName ?? raw.contactName ?? '';
  const relation = raw.relation ?? raw.Relation ?? raw.relacion ?? raw.Relación ?? raw.relationship ?? raw.parentesco ?? '';
  const phone = raw.phone ?? raw.telefono ?? raw.Telefono ?? raw.mobile ?? raw.celular ?? raw.cel ?? raw.tel ?? '';
  return { name: String(name), relation: String(relation), phone: String(phone) };
}

export default function PatientForm({ initialValues, mode = 'create', submitting = false, onSubmit, onCancel }: PatientFormProps) {

  const [form, setForm] = React.useState(() => {
    const birth = formatDateToInput(initialValues?.birthDate || '');
    const allergiesInput = Array.isArray(initialValues?.allergies)
      ? (initialValues?.allergies as string[]).join(', ')
      : typeof initialValues?.allergies === 'string'
      ? (initialValues?.allergies as string)
      : '';
    const ec = adaptEmergencyContact(initialValues?.emergencyContact);
    const userInit: UserState = { firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' };
    return {
      birthDate: birth,
      PatientSex: initialValues?.PatientSex || '',
      bloodType: initialValues?.bloodType || '',
      allergies: allergiesInput,
      ec,
      user: userInit,
    };
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    if (name.startsWith('ec.')) {
      const key = name.split('.')[1] as keyof ECState;
      setForm((f: any) => ({ ...f, ec: { ...f.ec, [key]: value } }));
    } else if (name.startsWith('user.')) {
      const key = name.split('.')[1] as keyof UserState;
      setForm((f: any) => ({ ...f, user: { ...f.user, [key]: value } }));
    } else {
      setForm((f: any) => ({ ...f, [name]: value }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (mode === 'create') {
      if (!form.user.firstName || !form.user.lastName || !form.user.email) {
        alert('Completa nombre, apellido y email del usuario.');
        return;
      }
      if (!form.user.password) {
        alert('La contraseña es obligatoria.');
        return;
      }
      if (form.user.password !== form.user.confirm) {
        alert('Las contraseñas no coinciden.');
        return;
      }
    }

    const allergiesArr =
      form.allergies && form.allergies.trim() !== ''
        ? form.allergies.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

    const hasEC =
      form.ec.name.trim() !== '' ||
      form.ec.relation.trim() !== '' ||
      form.ec.phone.trim() !== '';

    const patientPayload = {
      birthDate: form.birthDate || undefined,
      PatientSex: form.PatientSex || undefined,
      bloodType: form.bloodType || undefined,
      allergies: allergiesArr,
      emergencyContact: hasEC
        ? {
            name: form.ec.name.trim() || undefined,
            relation: form.ec.relation.trim() || undefined,
            phone: form.ec.phone.trim() || undefined,
          }
        : undefined,
    };

    if (mode === 'create') {
      const userPayload = {
        firstName: form.user.firstName.trim(),
        lastName: form.user.lastName.trim(),
        email: form.user.email.trim(),
        phone: form.user.phone.trim() || undefined,
        password: form.user.password,
        role: 'PATIENT',
      };
      onSubmit({ user: userPayload, patient: patientPayload });
    } else {
      onSubmit(patientPayload);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold">
        {mode === 'edit' ? 'Editar Paciente' : 'Nuevo Paciente'}
      </h2>

      {mode === 'create' && (
        <fieldset className="border rounded p-4">
          <legend className="text-sm font-medium px-1">Datos de Usuario</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col text-sm gap-1">
              Nombre
              <input name="user.firstName" value={form.user.firstName} onChange={handleChange} className="border rounded px-2 py-1" required />
            </label>
            <label className="flex flex-col text-sm gap-1">
              Apellido
              <input name="user.lastName" value={form.user.lastName} onChange={handleChange} className="border rounded px-2 py-1" required />
            </label>
            <label className="flex flex-col text-sm gap-1">
              Email
              <input type="email" name="user.email" value={form.user.email} onChange={handleChange} className="border rounded px-2 py-1" required />
            </label>
            <label className="flex flex-col text-sm gap-1">
              Teléfono
              <input name="user.phone" value={form.user.phone} onChange={handleChange} className="border rounded px-2 py-1" placeholder="+52..." />
            </label>
            <label className="flex flex-col text-sm gap-1">
              Contraseña
              <input type="password" name="user.password" value={form.user.password} onChange={handleChange} className="border rounded px-2 py-1" required minLength={6} />
            </label>
            <label className="flex flex-col text-sm gap-1">
              Confirmar
              <input type="password" name="user.confirm" value={form.user.confirm} onChange={handleChange} className="border rounded px-2 py-1" required minLength={6} />
            </label>
          </div>
        </fieldset>
      )}

      <fieldset className="border rounded p-4">
        <legend className="text-sm font-medium px-1">Datos del Paciente</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col text-sm gap-1">
            Fecha de Nacimiento
            <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} className="border rounded px-2 py-1" required={mode === 'create'} />
          </label>
          <label className="flex flex-col text-sm gap-1">
            Sexo
            <select name="PatientSex" value={form.PatientSex} onChange={handleChange} className="border rounded px-2 py-1" required={mode === 'create'}>
              <option value="">--</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
          </label>
          <label className="flex flex-col text-sm gap-1">
            Tipo de Sangre
            <input name="bloodType" value={form.bloodType} onChange={handleChange} className="border rounded px-2 py-1" placeholder="O+, A-, AB..." />
          </label>
          <label className="flex flex-col text-sm gap-1 md:col-span-2">
            Alergias (separadas por coma)
            <input name="allergies" value={form.allergies} onChange={handleChange} className="border rounded px-2 py-1" placeholder="polen, penicilina" />
          </label>
        </div>
      </fieldset>

      <fieldset className="border rounded p-4">
        <legend className="text-sm font-medium px-1">Contacto de Emergencia</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex flex-col text-xs gap-1">
            Nombre
            <input name="ec.name" value={form.ec.name} onChange={handleChange} className="border rounded px-2 py-1" />
          </label>
          <label className="flex flex-col text-xs gap-1">
            Relación
            <input name="ec.relation" value={form.ec.relation} onChange={handleChange} className="border rounded px-2 py-1" placeholder="Padre, Madre..." />
          </label>
          <label className="flex flex-col text-xs gap-1">
            Teléfono
            <input name="ec.phone" value={form.ec.phone} onChange={handleChange} className="border rounded px-2 py-1" placeholder="+52 555..." />
          </label>
        </div>
      </fieldset>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50" disabled={submitting}>
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50" disabled={submitting}>
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