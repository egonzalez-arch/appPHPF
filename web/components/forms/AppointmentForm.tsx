'use client';
import { useState, useEffect, useMemo } from 'react';
import { AppointmentEntity } from '@/lib/api/api.appointments';
import { useDoctorsLite } from '@/hooks/useDoctorsLite';
import { usePatientsLite } from '@/hooks/usePatientsLite';
import { useClinicsLite } from '@/hooks/useClinicsLite';

interface Props {
  mode: 'create' | 'edit';
  initialAppointment?: AppointmentEntity;
  submitting?: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  allowChangeRelationsOnEdit?: boolean;
}

export default function AppointmentForm({
  mode,
  initialAppointment,
  submitting,
  onSubmit,
  onCancel,
  allowChangeRelationsOnEdit = true,
}: Props) {

  const { data: doctors, isLoading: loadingDoctors } = useDoctorsLite(true);
  const { data: patients, isLoading: loadingPatients } = usePatientsLite(true);
  const { data: clinics, isLoading: loadingClinics } = useClinicsLite(true);

  const [form, setForm] = useState({
    clinicId: '',
    patientId: '',
    doctorId: '',
    startAt: '',
    endAt: '',
    reason: '',
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && initialAppointment) {
      setForm({
        clinicId: initialAppointment.clinicId,
        patientId: initialAppointment.patientId,
        doctorId: initialAppointment.doctorId,
        startAt: initialAppointment.startAt.slice(0,16), // recortar a yyyy-MM-ddTHH:mm
        endAt: initialAppointment.endAt.slice(0,16),
        reason: initialAppointment.reason || '',
      });
    }
  }, [mode, initialAppointment]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!form.startAt || !form.endAt) {
      setErrorMsg('Debe indicar inicio y fin');
      return;
    }

    const startISO = new Date(form.startAt).toISOString();
    const endISO = new Date(form.endAt).toISOString();

    if (new Date(endISO) <= new Date(startISO)) {
      setErrorMsg('La hora final debe ser posterior a la inicial');
      return;
    }

    if (mode === 'edit') {
      onSubmit({
        clinicId: allowChangeRelationsOnEdit ? form.clinicId : undefined,
        patientId: allowChangeRelationsOnEdit ? form.patientId : undefined,
        doctorId: allowChangeRelationsOnEdit ? form.doctorId : undefined,
        startAt: startISO,
        endAt: endISO,
        reason: form.reason || undefined,
      });
    } else {
      onSubmit({
        clinicId: form.clinicId,
        patientId: form.patientId,
        doctorId: form.doctorId,
        startAt: startISO,
        endAt: endISO,
        reason: form.reason || '',
      });
    }
  }

  const relationsDisabled = mode === 'edit' && !allowChangeRelationsOnEdit;

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="text-xl font-semibold">
        {mode === 'edit' ? 'Editar Cita' : 'Nueva Cita'}
      </h2>

      {errorMsg && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
          {errorMsg}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Clínica</label>
          <select
            name="clinicId"
            value={form.clinicId}
            onChange={handleChange}
            disabled={submitting || relationsDisabled || loadingClinics}
            required
            className="border px-3 py-2 rounded bg-white"
          >
            <option value="">Seleccionar</option>
            {clinics?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Doctor</label>
          <select
            name="doctorId"
            value={form.doctorId}
            onChange={handleChange}
            disabled={submitting || relationsDisabled || loadingDoctors}
            required
            className="border px-3 py-2 rounded bg-white"
          >
            <option value="">Seleccionar</option>
            {doctors?.map(d => {
              const fullName = [d.user?.firstName, d.user?.lastName].filter(Boolean).join(' ');
              return (
                <option key={d.id} value={d.id}>
                  {fullName || d.id}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Paciente</label>
          <select
            name="patientId"
            value={form.patientId}
            onChange={handleChange}
            disabled={submitting || relationsDisabled || loadingPatients}
            required
            className="border px-3 py-2 rounded bg-white"
          >
            <option value="">Seleccionar</option>
            {patients?.map(p => {
              const fullName = [p.user?.firstName, p.user?.lastName].filter(Boolean).join(' ');
              return (
                <option key={p.id} value={p.id}>
                  {fullName || p.id}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Motivo</label>
          <input
            name="reason"
            value={form.reason}
            onChange={handleChange}
            placeholder="Motivo / Nota"
            className="border px-3 py-2 rounded"
            maxLength={255}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Inicio</label>
          <input
            type="datetime-local"
            name="startAt"
            value={form.startAt}
            onChange={handleChange}
            required
            className="border px-3 py-2 rounded"
            disabled={submitting}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Fin</label>
          <input
            type="datetime-local"
            name="endAt"
            value={form.endAt}
            onChange={handleChange}
            required
            className="border px-3 py-2 rounded"
            disabled={submitting}
          />
        </div>

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
          {submitting ? 'Guardando...' : (mode === 'edit' ? 'Guardar' : 'Crear')}
        </button>
      </div>
    </form>
  );
}