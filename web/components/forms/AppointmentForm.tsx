'use client';

import { useState, useEffect } from 'react';
import { AppointmentEntity } from '@/lib/api/api.appointments';
import { useDoctorsLite } from '@/hooks/useDoctorsLite';
import { usePatientsLite } from '@/hooks/usePatientsLite';
import { useClinicsLite } from '@/hooks/useClinicsLite';

interface AppointmentFormProps {
  mode: 'create' | 'edit';
  initialAppointment?: AppointmentEntity;
  submitting?: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  allowChangeRelationsOnEdit?: boolean;
  existingAppointments?: AppointmentEntity[];
  prefillStart?: Date | null;
  prefillEnd?: Date | null;
}

export default function AppointmentForm({
  mode,
  initialAppointment,
  submitting,
  onSubmit,
  onCancel,
  allowChangeRelationsOnEdit = true,
  existingAppointments = [],
  prefillStart = null,
  prefillEnd = null,
}: AppointmentFormProps) {
  const { data: doctors, isLoading: loadingDoctors } = useDoctorsLite(true);
  const { data: patients, isLoading: loadingPatients } = usePatientsLite(true);
  const { data: clinics, isLoading: loadingClinics } = useClinicsLite(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    clinicId: '',
    patientId: '',
    doctorId: '',
    startAt: '',
    endAt: '',
    reason: '',
  });

  useEffect(() => {
    if (mode === 'edit' && initialAppointment) {
      setForm({
        clinicId: initialAppointment.clinicId,
        patientId: initialAppointment.patientId,
        doctorId: initialAppointment.doctorId,
        startAt: initialAppointment.startAt.slice(0, 16),
        endAt: initialAppointment.endAt.slice(0, 16),
        reason: initialAppointment.reason || '',
      });
    } else if (mode === 'create' && prefillStart && prefillEnd) {
      // Prefill a partir de selección en calendario
      const toInput = (d: Date) =>
        new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
      setForm((f) => ({
        ...f,
        startAt: toInput(prefillStart),
        endAt: toInput(prefillEnd),
      }));
    }
  }, [mode, initialAppointment, prefillStart, prefillEnd]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function hasClientOverlap(
    doctorId: string,
    start: Date,
    end: Date,
    currentId?: string,
  ) {
    return existingAppointments.some((a) => {
      if (a.doctorId !== doctorId) return false;
      if (currentId && a.id === currentId) return false;
      const aStart = new Date(a.startAt).getTime();
      const aEnd = new Date(a.endAt).getTime();
      return aStart < end.getTime() && aEnd > start.getTime();
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!form.startAt || !form.endAt) {
      setErrorMsg('Debe indicar fecha/hora de inicio y fin.');
      return;
    }

    const start = new Date(form.startAt);
    const end = new Date(form.endAt);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setErrorMsg('Formato de fecha inválido.');
      return;
    }
    if (end <= start) {
      setErrorMsg('La hora final debe ser posterior a la inicial.');
      return;
    }

    const effectiveDoctorId =
      mode === 'edit'
        ? allowChangeRelationsOnEdit
          ? form.doctorId
          : initialAppointment?.doctorId!
        : form.doctorId;

    if (
      hasClientOverlap(effectiveDoctorId, start, end, initialAppointment?.id)
    ) {
      setErrorMsg(
        'Existe solapamiento con otra cita del doctor (validación cliente).',
      );
      return;
    }

    if (mode === 'edit') {
      onSubmit({
        clinicId: allowChangeRelationsOnEdit ? form.clinicId : undefined,
        patientId: allowChangeRelationsOnEdit ? form.patientId : undefined,
        doctorId: allowChangeRelationsOnEdit ? form.doctorId : undefined,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        reason: form.reason || undefined,
      });
    } else {
      if (!form.clinicId || !form.patientId || !form.doctorId) {
        setErrorMsg('Debe seleccionar clínica, paciente y doctor.');
        return;
      }
      onSubmit({
        clinicId: form.clinicId,
        patientId: form.patientId,
        doctorId: form.doctorId,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
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
            {clinics?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
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
            {doctors?.map((d) => {
              const fullName = [d.user?.firstName, d.user?.lastName]
                .filter(Boolean)
                .join(' ');
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
            {patients?.map((p) => {
              const fullName = [p.user?.firstName, p.user?.lastName]
                .filter(Boolean)
                .join(' ');
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
            disabled={submitting}
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
            disabled={submitting}
            className="border px-3 py-2 rounded"
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
            disabled={submitting}
            className="border px-3 py-2 rounded"
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
          {submitting
            ? 'Guardando...'
            : mode === 'edit'
            ? 'Guardar'
            : 'Crear'}
        </button>
      </div>
    </form>
  );
}