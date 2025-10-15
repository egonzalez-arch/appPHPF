'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
} from '@/lib/api/api.appointments';
import { fetchPatients, Patient } from '@/lib/api/api';
import { useEncounterAudit } from '@/hooks/useEncounterAudit';

// Helpers
function formatDate(iso?: string) {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } catch { return iso; }
}
function statusLabel(s?: string) {
  switch (s) {
    case 'IN_PROGRESS': return 'En progreso';
    case 'COMPLETED': return 'Completado';
    case 'CANCELLED': return 'Cancelado';
    default: return s || '-';
  }
}
function isValidUuid(v?: string | null) {
  if (!v) return false;
  // UUID v4 genérica
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export default function ManageEncounterPage() {
  const router = useRouter();
  const search = useSearchParams();

  // Sanea el query param: puede venir el string "undefined"
  const qpEncounterId = search.get('encounterId');
  const qpAppointmentId = search.get('appointmentId');
  const encounterId = qpEncounterId && qpEncounterId !== 'undefined' ? qpEncounterId : null;
  const appointmentId = qpAppointmentId && qpAppointmentId !== 'undefined' ? qpAppointmentId : null;

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
    () => appointments.find(a => a.id === (encounter?.appointmentId || appointmentId || '')),
    [appointments, encounter?.appointmentId, appointmentId],
  );

  const patientName = useMemo(() => {
    if (!appointment) return '';
    const p = patients.find(px => px.id === appointment.patientId);
    const full = [p?.user?.firstName, p?.user?.lastName].filter(Boolean).join(' ');
    return full || appointment.patientId;
  }, [patients, appointment]);

  // Audit solo si hay un id válido
  const auditEncounterId = isValidUuid(encounter?.id || undefined) ? encounter!.id : undefined;
  const { data: auditEvents, isLoading: auditLoading, isError: auditError, error: auditErr } =
    useEncounterAudit(auditEncounterId);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const [appts, pats] = await Promise.all([fetchAppointments(), fetchPatients()]);
        if (!mounted) return;
        setAppointments(appts);
        setPatients(pats);

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
          setVitals(vit);
        } else {
          setEncounter(null);
          setReason('');
          setDiagnosis('');
          setNotes('');
          setStatus('IN_PROGRESS');
          setVitals([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [encounterId, appointmentId]);

  async function saveEncounter() {
    setSaving(true);
    try {
      const currentId = encounter?.id;
      if (isValidUuid(currentId)) {
        const updated = await updateEncounter(currentId!, { reason, diagnosis, notes, status });
        setEncounter(updated);
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
      } else {
        alert('No hay referencia válida de encuentro o cita para guardar.');
      }
    } catch (e: unknown) {
      alert((e as Error)?.message || 'Error guardando encuentro');
    } finally {
      setSaving(false);
    }
  }

  async function addVitals() {
    if (!isValidUuid(encounter?.id)) {
      alert('Primero guarda el encuentro (no hay ID válido).');
      return;
    }
    if (vHeight === '' || vWeight === '' || vHR === '' || vBP.trim() === '' || vSpO2 === '') {
      alert('Completa todos los campos de signos vitales.');
      return;
    }
    try {
      const bmi = Number(vWeight) / ((Number(vHeight) / 100) ** 2);
      await createVitals({
        encounterId: encounter!.id,
        height: Number(vHeight),
        weight: Number(vWeight),
        hr: Number(vHR),
        bp: vBP,
        spo2: Number(vSpO2),
        bmi,
        recordedAt: new Date().toISOString(),
      });
      const vit = await fetchVitals({ encounterId: encounter!.id });
      setVitals(vit);

      // reset parciales
      setVHR(''); setVBP(''); setVSpO2('');
    } catch (e: unknown) {
      alert((e as Error)?.message || 'Error guardando signos vitales');
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

      {/* Encabezado contexto */}
      <div className="bg-white rounded border p-4">
        {loading ? (
          <div>Cargando...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            <div><span className="font-medium">Paciente:</span> {patientName || '-'}</div>
            <div><span className="font-medium">Fecha de cita:</span> {formatDate(appointment?.startAt)}</div>
            <div><span className="font-medium">Estado encuentro:</span> {encounter?.status ? statusLabel(encounter.status) : statusLabel(status)}</div>
          </div>
        )}
      </div>

      {/* Form Encuentro */}
      <div className="bg-white rounded border p-4">
        <h2 className="text-lg font-semibold mb-3">Datos del encuentro</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Motivo</label>
            <input className="border rounded px-3 py-2 w-full" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo de consulta" />
          </div>
          <div>
            <label className="block text-sm font-medium">Diagnóstico</label>
            <input className="border rounded px-3 py-2 w-full" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Diagnóstico principal" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Notas</label>
            <textarea className="border rounded px-3 py-2 w-full" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas adicionales" />
          </div>
          <div>
            <label className="block text-sm font-medium">Estado</label>
            <select className="border rounded px-3 py-2 w-full bg-white" value={status} onChange={(e) => setStatus(e.target.value as EncounterStatus)}>
              <option value="IN_PROGRESS">En progreso</option>
              <option value="COMPLETED">Completado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Signos Vitales */}
      <div className="bg-white rounded border p-4">
        <h2 className="text-lg font-semibold mb-3">Signos vitales</h2>

        <ul className="text-sm mb-4">
          {vitals.length === 0 ? (
            <li className="text-gray-500">No hay signos vitales registrados</li>
          ) : (
            vitals.map(v => (
              <li key={v.id} className="py-1">
                <strong>{formatDate(v.recordedAt)}:</strong> {v.height}cm, {v.weight}kg, IMC {v.bmi?.toFixed(2)}, HR {v.hr}, BP {v.bp}, SpO2 {v.spo2}%
              </li>
            ))
          )}
        </ul>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium">Altura (cm)</label>
            <input type="number" className="border rounded px-3 py-2 w-full" value={vHeight} onChange={(e) => setVHeight(e.target.value === '' ? '' : Number(e.target.value))} placeholder="170" />
          </div>
          <div>
            <label className="block text-sm font-medium">Peso (kg)</label>
            <input type="number" className="border rounded px-3 py-2 w-full" value={vWeight} onChange={(e) => setVWeight(e.target.value === '' ? '' : Number(e.target.value))} placeholder="70" />
          </div>
          <div>
            <label className="block text-sm font-medium">IMC (auto)</label>
            <input disabled className="border rounded px-3 py-2 w-full bg-gray-100" value={vHeight && vWeight ? (Number(vWeight) / ((Number(vHeight) / 100) ** 2)).toFixed(2) : ''} placeholder="—" />
          </div>
          <div>
            <label className="block text-sm font-medium">Frecuencia cardiaca (HR)</label>
            <input type="number" className="border rounded px-3 py-2 w-full" value={vHR} onChange={(e) => setVHR(e.target.value === '' ? '' : Number(e.target.value))} placeholder="72" />
          </div>
          <div>
            <label className="block text-sm font-medium">Presión arterial (BP)</label>
            <input className="border rounded px-3 py-2 w-full" value={vBP} onChange={(e) => setVBP(e.target.value)} placeholder="120/80" />
          </div>
          <div>
            <label className="block text-sm font-medium">SpO2 (%)</label>
            <input type="number" className="border rounded px-3 py-2 w-full" value={vSpO2} onChange={(e) => setVSpO2(e.target.value === '' ? '' : Number(e.target.value))} placeholder="98" />
          </div>
        </div>
        <div className="pt-4">
          <button onClick={addVitals} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">
            Guardar signos vitales
          </button>
        </div>
      </div>

      {/* Historial del encuentro */}
      <div className="bg-white rounded border p-4">
        <h2 className="text-lg font-semibold mb-3">Historial del encuentro</h2>
        {auditEncounterId ? (
          <>
            {auditLoading && <div className="text-sm text-gray-600">Cargando historial...</div>}
            {auditError && <div className="text-sm text-red-600">{String(auditErr)}</div>}
            {!auditLoading && !auditError && (!auditEvents || auditEvents.length === 0) && (
              <div className="text-sm text-gray-500">Sin eventos registrados.</div>
            )}
            {!auditLoading && !!auditEvents?.length && (
              <ol className="relative border-l border-gray-200 ml-2">
                {auditEvents.map(ev => (
                  <li key={ev.id} className="mb-4 ml-4">
                    <div className="absolute w-2 h-2 bg-teal-500 rounded-full -left-1.5 top-1" />
                    <time className="block text-[11px] text-gray-500">{formatDate(ev.createdAt)}</time>
                    <div className="text-xs font-medium capitalize">
                      {ev.action === 'create'
                        ? 'Encuentro creado'
                        : ev.action === 'update'
                        ? 'Encuentro actualizado'
                        : ev.action === 'status-change'
                        ? 'Cambio de estado'
                        : ev.action === 'delete'
                        ? 'Encuentro eliminado'
                        : ev.action}
                    </div>
                    {ev.metadataJson?.changes && (
                      <pre className="mt-1 bg-gray-50 border text-[10px] p-2 rounded overflow-x-auto">
{JSON.stringify(ev.metadataJson.changes, null, 2)}
                      </pre>
                    )}
                    {ev.metadataJson?.oldStatus && ev.metadataJson?.newStatus && (
                      <div className="text-[11px] text-gray-600 mt-1">
                        {statusLabel(ev.metadataJson.oldStatus)} → {statusLabel(ev.metadataJson.newStatus)}
                      </div>
                    )}
                    {ev.metadataJson?.reason && (
                      <div className="text-[11px] text-gray-600 mt-1">Motivo: {ev.metadataJson.reason}</div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-500">El historial se habilita cuando el encuentro existe.</div>
        )}
      </div>

      {/* Botones finales */}
      <div className="flex justify-end gap-2">
        <button onClick={() => router.push('/dashboard/appointments')} className="px-5 py-2.5 rounded border text-gray-700 hover:bg-gray-100">
          Cancelar
        </button>
        <button onClick={saveEncounter} disabled={saving} className="px-5 py-2.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Guardando...' : encounter ? 'Guardar cambios' : 'Crear encuentro'}
        </button>
      </div>
    </div>
  );
}