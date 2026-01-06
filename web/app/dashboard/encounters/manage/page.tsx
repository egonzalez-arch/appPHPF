'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  fetchEncounter,
  createEncounter,
  updateEncounter,
  EncounterEntity,
  EncounterStatus,
} from '@/lib/api/api.encounters';
import {
  fetchVitals,
  createVitals,
  VitalsEntity,
} from '@/lib/api/api.vitals';
import {
  fetchAppointments,
  AppointmentEntity,
  AppointmentStatus,
} from '@/lib/api/api.appointments';
import { fetchPatients, Patient } from '@/lib/api/api';
import { useEncounterAudit } from '@/hooks/useEncounterAudit';
import { createAuditEvent } from '@/lib/api/api.audit';
import { useDoctorsLite } from '@/hooks/useDoctorsLite';
import { useClinicsLite } from '@/hooks/useClinicsLite';
import { usePatientsLite } from '@/hooks/usePatientsLite';
import { useUpdateAppointmentStatus } from '@/hooks/useAppointments';
import {
  isUserAssignedDoctorForAppointment,
  normalizeId,
} from '@/lib/auth/doctorAuth';

// Helpers
function formatDate(iso?: string) {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } catch {
    return iso;
  }
}
function statusLabel(s?: string) {
  switch (s) {
    case 'IN_PROGRESS':
      return 'En progreso';
    case 'COMPLETED':
      return 'Completado';
    case 'CANCELLED':
      return 'Cancelado';
    default:
      return s || '-';
  }
}
function isValidUuid(v?: string | null) {
  if (!v) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );
}

export default function ManageEncounterPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { user: sessionUser } = useAuth();
  const { data: doctorsLite } = useDoctorsLite(true);
  const { data: clinicsLite } = useClinicsLite(true);
  const { data: patientsLite } = usePatientsLite(true);
  const updateApptStatusMut = useUpdateAppointmentStatus();

  // Sanea el query param: puede venir el string "undefined"
  const qpEncounterId = search.get('encounterId');
  const qpAppointmentId = search.get('appointmentId');
  const encounterId =
    qpEncounterId && qpEncounterId !== 'undefined' ? qpEncounterId : null;
  const appointmentId =
    qpAppointmentId && qpAppointmentId !== 'undefined'
      ? qpAppointmentId
      : null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [encounter, setEncounter] = useState<EncounterEntity | null>(null);
  const [vitals, setVitals] = useState<VitalsEntity[]>([]);
  const [appointments, setAppointments] = useState<AppointmentEntity[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  // Form Encuentro
  const [reason, setReason] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<EncounterStatus>('IN_PROGRESS');

  // Form Vitals
  const [vHeight, setVHeight] = useState<number | ''>('');
  const [vWeight, setVWeight] = useState<number | ''>('');
  const [vHR, setVHR] = useState<number | ''>('');
  const [vBP, setVBP] = useState('');
  const [vSpO2, setVSpO2] = useState<number | ''>('');

  const appointment = useMemo(
    () =>
      appointments.find(
        (a) => a.id === (encounter?.appointmentId || appointmentId || ''),
      ) || null,
    [appointments, encounter?.appointmentId, appointmentId],
  );

  // Datos “lite” para mostrar clínica, doctor y paciente
  const clinicName = useMemo(() => {
    if (!appointment) return '-';
    return (
      clinicsLite?.find((c) => c.id === appointment.clinicId)?.name ||
      appointment.clinicId ||
      '-'
    );
  }, [appointment, clinicsLite]);

  const doctorName = useMemo(() => {
    if (!appointment) return '-';
    const d = doctorsLite?.find((doc) => doc.id === appointment.doctorId);
    if (!d) return appointment.doctorId || '-';
    const full = [d.user?.firstName, d.user?.lastName]
      .filter(Boolean)
      .join(' ');
    return full || d.user?.email || appointment.doctorId;
  }, [appointment, doctorsLite]);

  const patientName = useMemo(() => {
    if (!appointment) return '-';
    const pFull = patients.find((px) => px.id === appointment.patientId);
    const lite = patientsLite?.find((pl) => pl.id === appointment.patientId);
    const fullFromApi = pFull
      ? [pFull.user?.firstName, pFull.user?.lastName]
          .filter(Boolean)
          .join(' ')
      : '';
    const fullFromLite = lite
      ? [lite.user?.firstName, lite.user?.lastName]
          .filter(Boolean)
          .join(' ')
      : '';
    return (
      fullFromApi ||
      fullFromLite ||
      appointment.patientId ||
      '-'
    );
  }, [patients, patientsLite, appointment]);

  // Audit solo si hay un id válido
  const auditEncounterId = isValidUuid(encounter?.id || undefined)
    ? encounter!.id
    : undefined;
  const {
    data: auditEvents,
    isLoading: auditLoading,
    isError: auditError,
    error: auditErr,
  } = useEncounterAudit(auditEncounterId);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);

        const [appts, pats] = await Promise.all([
          fetchAppointments(),
          fetchPatients(),
        ]);
        if (!mounted) return;
        setAppointments(Array.isArray(appts) ? appts : []);
        setPatients(Array.isArray(pats) ? pats : []);

        // Si viene encounterId válido, carga encuentro; si no, modo crear
        if (isValidUuid(encounterId)) {
          const enc = await fetchEncounter(encounterId!);
          if (!mounted) return;
          setEncounter(enc);
          setReason(enc.reason || '');
          setDiagnosis(enc.diagnosis || '');
          setNotes(enc.notes || '');
          setStatus(enc.status || 'IN_PROGRESS');

          const vit = await fetchVitals({ encounterId: enc.id });
          if (!mounted) return;
          setVitals(Array.isArray(vit) ? vit : []);
        } else {
          if (appointmentId && !appts.find((a) => a.id === appointmentId)) {
            try {
              const refreshed = await fetchAppointments();
              if (!mounted) return;
              setAppointments(Array.isArray(refreshed) ? refreshed : appts);
            } catch {
              // ignore
            }
          }

          setEncounter(null);
          setReason('');
          setDiagnosis('');
          setNotes('');
          setStatus('IN_PROGRESS');
          setVitals([]);
        }
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('ManageEncounter load error', err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [encounterId, appointmentId]);

  const creatingMode =
    !isValidUuid(encounter?.id || undefined) && isValidUuid(appointmentId);

  if (process.env.NODE_ENV !== 'production') {
    console.log('[ManageEncounter] creatingMode:', creatingMode);
    console.log('[ManageEncounter] appointmentId:', appointmentId);
    console.log('[ManageEncounter] appointment.doctorId:', appointment?.doctorId);
    console.log('[ManageEncounter] sessionUser ids:', {
      id: normalizeId((sessionUser as any)?.id),
      sub: normalizeId((sessionUser as any)?.sub),
    });
  }

  const canEditOrCreate =
    !creatingMode ||
    isUserAssignedDoctorForAppointment(appointment, doctorsLite, sessionUser);

  // ¿el formulario de signos vitales está completo?
  const hasCompleteVitalsForm =
    vHeight !== '' &&
    vWeight !== '' &&
    vHR !== '' &&
    vBP.trim() !== '' &&
    vSpO2 !== '';

  async function saveEncounter() {
    if (
      creatingMode &&
      !isUserAssignedDoctorForAppointment(appointment, doctorsLite, sessionUser)
    ) {
      alert('Solo el doctor asignado puede iniciar el encuentro.');
      return;
    }

    setSaving(true);
    try {
      const currentId = encounter?.id;
      let saved: EncounterEntity | null = null;

      // 1) Crear o actualizar encuentro
      if (isValidUuid(currentId)) {
        const updated = await updateEncounter(currentId!, {
          reason,
          diagnosis,
          notes,
          status,
        });
        const merged = {
          ...(encounter || {}),
          ...(updated || {}),
        } as EncounterEntity;
        setEncounter(merged);
        saved = merged;
      } else if (isValidUuid(appointmentId)) {
        const created = await createEncounter({
          appointmentId: appointmentId!,
          encounterDate: new Date().toISOString(),
          reason,
          diagnosis,
          notes,
          status,
        });
        setEncounter(created);
        saved = created;
      } else {
        alert('No hay referencia válida de encuentro o cita para guardar.');
      }

      if (!saved) {
        setSaving(false);
        return;
      }

      const userId = (sessionUser as any)?.id ?? (sessionUser as any)?.sub;

      // 2) Si la cita existe, ponerla en IN_PROGRESS (si no está ya completada/cancelada)
      if (appointment) {
        const apptStatus = appointment.status as AppointmentStatus;
        if (
          apptStatus !== AppointmentStatus.COMPLETED &&
          apptStatus !== AppointmentStatus.CANCELLED &&
          apptStatus !== AppointmentStatus.CONFIRMED // si quieres forzar siempre IN_PROGRESS al entrar
        ) {
          updateApptStatusMut.mutate(
            { id: appointment.id, status: AppointmentStatus.IN_PROGRESS },
            {
              onSuccess: (updatedAppt) => {
                setAppointments((prev) =>
                  prev.map((a) =>
                    a.id === updatedAppt.id ? { ...a, ...updatedAppt } : a,
                  ),
                );
              },
              onError: () => {
                // no bloqueamos el flujo del encuentro, solo avisar si quieres
                if (process.env.NODE_ENV !== 'production') {
                  console.warn(
                    'No se pudo actualizar el estado de la cita a IN_PROGRESS',
                  );
                }
              },
            },
          );
        }
      }

      // 3) Audit de creación/actualización del encuentro
      void createAuditEvent({
        action: currentId ? 'encounter.update' : 'encounter.create',
        entity: 'encounter',
        entityId: saved.id,
        metadata: {
          appointmentId: saved.appointmentId,
          status: saved.status,
          reason: saved.reason ?? undefined,
        },
        userId,
        actorUserId: userId,
      });

      // 4) Si el formulario de signos vitales está completo, guardarlos automáticamente
      if (hasCompleteVitalsForm) {
        const bmi = Number(vWeight) / (Number(vHeight) / 100) ** 2;

        await createVitals({
          encounterId: saved.id,
          height: Number(vHeight),
          weight: Number(vWeight),
          hr: Number(vHR),
          bp: vBP,
          spo2: Number(vSpO2),
          bmi,
          recordedAt: new Date().toISOString(),
        });

        const vit = await fetchVitals({ encounterId: saved.id });
        setVitals(Array.isArray(vit) ? vit : []);

        // limpiar inputs de HR/BP/SpO2 (altura/peso se suelen mantener)
        setVHR('');
        setVBP('');
        setVSpO2('');

        void createAuditEvent({
          action: 'encounter.add_vitals',
          entity: 'encounter',
          entityId: saved.id,
          metadata: {
            height: Number(vHeight),
            weight: Number(vWeight),
            hr: Number(vHR),
            bp: vBP,
            spo2: Number(vSpO2),
            bmi,
          },
          userId,
          actorUserId: userId,
        });
      }
    } catch (e: unknown) {
      alert((e as Error)?.message || 'Error guardando encuentro');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {encounter ? 'Editar encuentro' : 'Iniciar encuentro'}
        </h1>
        <button
          className="px-3 py-2 rounded border hover:bg-gray-50"
          onClick={() => router.push('/dashboard/appointments')}
        >
          Volver a Citas
        </button>
      </div>

      {/* Información de la cita */}
      <div className="bg-white rounded border p-4">
        {loading ? (
          <div>Cargando...</div>
        ) : appointment ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="font-medium">Clínica:</span>{' '}
              {clinicName}
            </div>
            <div>
              <span className="font-medium">Doctor:</span>{' '}
              {doctorName}
            </div>
            <div>
              <span className="font-medium">Paciente:</span>{' '}
              {patientName}
            </div>
            <div>
              <span className="font-medium">Fecha y hora:</span>{' '}
              {formatDate(appointment.startAt)}{' '}
              {appointment.endAt
                ? `– ${new Date(appointment.endAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : ''}
            </div>
            <div>
              <span className="font-medium">Estado de la cita:</span>{' '}
              {appointment.status}
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <span className="font-medium">Motivo de la cita:</span>{' '}
              {appointment.reason || '-'}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            No se encontró la información de la cita.
          </div>
        )}
      </div>

      {/* Información del encuentro (estado resumido) */}
      <div className="bg-white rounded border p-4">
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <div>
            <span className="font-medium">Estado del encuentro:</span>{' '}
            {encounter?.status
              ? statusLabel(encounter.status)
              : statusLabel(status)}
          </div>
          <div>
            <span className="font-medium">ID encuentro:</span>{' '}
            {encounter?.id || '-'}
          </div>
          <div>
            <span className="font-medium">ID cita:</span>{' '}
            {appointment?.id || appointmentId || '-'}
          </div>
        </div>
      </div>

      {/* Form Encuentro + Signos vitales */}
      <fieldset disabled={!canEditOrCreate}>
        <div className="bg-white rounded border p-4">
          <h2 className="text-lg font-semibold mb-3">Datos del encuentro</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Motivo</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Motivo de consulta"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Diagnóstico</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Diagnóstico principal"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Notas</label>
              <textarea
                className="border rounded px-3 py-2 w-full"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Estado</label>
              <select
                className="border rounded px-3 py-2 w-full bg-white"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as EncounterStatus)
                }
              >
                <option value="IN_PROGRESS">En progreso</option>
                <option value="COMPLETED">Completado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Signos Vitales */}
        <div className="bg-white rounded border p-4 mt-4">
          <h2 className="text-lg font-semibold mb-3">
            Signos vitales (se guardan al crear/guardar encuentro)
          </h2>

          <ul className="text-sm mb-4">
            {vitals.length === 0 ? (
              <li className="text-gray-500">
                No hay signos vitales registrados
              </li>
            ) : (
              vitals.map((v) => (
                <li key={v.id} className="py-1">
                  <strong>
                    {v.recordedAt ? formatDate(v.recordedAt) : ''}:
                  </strong>{' '}
                  {v.height}cm, {v.weight}kg, IMC {v.bmi?.toFixed(2)}, HR{' '}
                  {v.hr}, BP {v.bp}, SpO2 {v.spo2}%
                </li>
              ))
            )}
          </ul>

          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium">Altura (cm)</label>
              <input
                type="number"
                className="border rounded px-3 py-2 w-full"
                value={vHeight}
                onChange={(e) =>
                  setVHeight(
                    e.target.value === '' ? '' : Number(e.target.value),
                  )
                }
                placeholder="170"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Peso (kg)</label>
              <input
                type="number"
                className="border rounded px-3 py-2 w-full"
                value={vWeight}
                onChange={(e) =>
                  setVWeight(
                    e.target.value === '' ? '' : Number(e.target.value),
                  )
                }
                placeholder="70"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                IMC (auto)
              </label>
              <input
                disabled
                className="border rounded px-3 py-2 w-full bg-gray-100"
                value={
                  vHeight && vWeight
                    ? (
                        Number(vWeight) /
                        (Number(vHeight) / 100) ** 2
                      ).toFixed(2)
                    : ''
                }
                placeholder="IMC calculado"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Frecuencia cardiaca (HR)
              </label>
              <input
                type="number"
                className="border rounded px-3 py-2 w-full"
                value={vHR}
                onChange={(e) =>
                  setVHR(
                    e.target.value === '' ? '' : Number(e.target.value),
                  )
                }
                placeholder="72"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Presión arterial (BP)
              </label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={vBP}
                onChange={(e) => setVBP(e.target.value)}
                placeholder="120/80"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                SpO2 (%)
              </label>
              <input
                type="number"
                className="border rounded px-3 py-2 w-full"
                value={vSpO2}
                onChange={(e) =>
                  setVSpO2(
                    e.target.value === '' ? '' : Number(e.target.value),
                  )
                }
                placeholder="98"
              />
            </div>
          </div>
          {/* Sin botón: se guarda automáticamente en saveEncounter */}
        </div>
      </fieldset>

      {creatingMode && !canEditOrCreate && (
        <div className="mt-3 p-3 rounded bg-yellow-50 text-yellow-800 border border-yellow-200">
          Solo el doctor asignado a la cita puede iniciar este encuentro.
        </div>
      )}

      {/* Historial del encuentro */}
      <div className="bg-white rounded border p-4">
        <h2 className="text-lg font-semibold mb-3">Historial del encuentro</h2>
        {auditEncounterId ? (
          <>
            {auditLoading && (
              <div className="text-sm text-gray-600">
                Cargando historial...
              </div>
            )}
            {auditError && (
              <div className="text-sm text-red-600">
                {String(auditErr)}
              </div>
            )}
            {!auditLoading &&
              !auditError &&
              (!auditEvents || auditEvents.length === 0) && (
                <div className="text-sm text-gray-500">
                  Sin eventos registrados.
                </div>
              )}
            {!auditLoading && !!auditEvents?.length && (
              <ol className="relative border-l border-gray-200 ml-2">
                {auditEvents.map((ev) => (
                  <li key={ev.id} className="mb-4 ml-4">
                    <div className="absolute w-2 h-2 bg-teal-500 rounded-full -left-1.5 top-1" />
                    <time className="block text-[11px] text-gray-500">
                      {formatDate(ev.createdAt)}
                    </time>
                    <div className="text-xs font-medium capitalize">
                      {ev.action === 'create'
                        ? 'Encuentro creado'
                        : ev.action === 'update'
                        ? 'Encuentro actualizado'
                        : ev.action === 'delete'
                        ? 'Encuentro eliminado'
                        : ev.action}
                    </div>
                    {ev.metadataJson?.changes && (
                      <pre className="mt-1 bg-gray-50 border text-[10px] p-2 rounded overflow-x-auto">
{JSON.stringify(ev.metadataJson.changes, null, 2)}
                      </pre>
                    )}
                    {ev.metadataJson?.oldStatus &&
                      ev.metadataJson?.newStatus && (
                        <div className="text-[11px] text-gray-600 mt-1">
                          {statusLabel(ev.metadataJson.oldStatus)} →{' '}
                          {statusLabel(ev.metadataJson.newStatus)}
                        </div>
                      )}
                    {ev.metadataJson?.reason && (
                      <div className="text-[11px] text-gray-600 mt-1">
                        Motivo: {ev.metadataJson.reason}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-500">
            El historial se habilita cuando el encuentro existe.
          </div>
        )}
      </div>

      {/* Botones finales */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => router.push('/dashboard/appointments')}
          className="px-5 py-2.5 rounded border text-gray-700 hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          onClick={saveEncounter}
          disabled={saving}
          className="px-5 py-2.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving
            ? 'Guardando...'
            : encounter
            ? 'Guardar cambios'
            : 'Crear encuentro'}
        </button>
      </div>
    </div>
  );
}