'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  fetchEncounter,
  updateEncounter,
  EncounterEntity,
} from '@/lib/api/api.encounters';
import { fetchVitals, VitalsEntity } from '@/lib/api/api.vitals';
import { fetchAppointments, AppointmentEntity } from '@/lib/api/api.appointments';
import { useDoctorsLite } from '@/hooks/useDoctorsLite';
import { usePatientsLite } from '@/hooks/usePatientsLite';
import { useClinicsLite } from '@/hooks/useClinicsLite';
import { createAuditEvent } from '@/lib/api/api.audit';
import Link from 'next/link';

export default function EncounterViewPage() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const encounterId = params?.id;
  const [encounter, setEncounter] = useState<EncounterEntity | null>(null);
  const [appointment, setAppointment] = useState<AppointmentEntity | null>(null);
  const [vitals, setVitals] = useState<VitalsEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const hasLoggedView = useRef(false);

  const { data: doctors } = useDoctorsLite(true);
  const { data: patients } = usePatientsLite(true);
  const { data: clinics } = useClinicsLite(true);

  useEffect(() => {
    if (!encounterId) {
      setError('ID de encuentro inválido');
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const e = await fetchEncounter(encounterId);
        if (!mounted) return;
        setEncounter(e || null);

        // Fetch vitals separately to ensure we show them even if backend doesn't embed them.
        if (e?.id) {
          try {
            const vit = await fetchVitals({ encounterId: e.id });
            if (!mounted) return;
            setVitals(Array.isArray(vit) ? vit : []);
          } catch {
            if (!mounted) return;
            setVitals([]);
          }
        } else {
          setVitals([]);
        }

        // Audit: log view once per mount
        if (!hasLoggedView.current && e) {
          hasLoggedView.current = true;
          createAuditEvent({
            action: 'encounter.view',
            entity: 'encounter',
            entityId: encounterId,
            metadata: {
              appointmentId: e?.appointmentId ?? null,
              patientId: e?.patientId ?? null,
            },
          });
        }

        // If encounter includes appointmentId, try loading the appointment for display
        const apptId = e?.appointmentId;
        if (apptId) {
          try {
            const appts = await fetchAppointments();
            if (!mounted) return;
            const found = appts.find(a => a.id === apptId) || null;
            setAppointment(found);
          } catch {
            // non-fatal
            setAppointment(null);
          }
        } else {
          setAppointment(null);
        }
      } catch (err: any) {
        if (!mounted) return;
        setError(String(err?.message || err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [encounterId]);

  function findDoctorName(id?: string) {
    const realId = id || appointment?.doctorId;
    const d = doctors?.find((x) => x.id === realId);
    const full = [d?.user?.firstName, d?.user?.lastName].filter(Boolean).join(' ');
    return full || realId || '-';
  }

  function findPatientName(id?: string) {
    const realId = id || appointment?.patientId;
    const p = patients?.find((x) => x.id === realId);
    const full = [p?.user?.firstName, p?.user?.lastName].filter(Boolean).join(' ');
    return full || realId || '-';
  }

  function findClinicName(id?: string) {
    const realId = id || appointment?.clinicId;
    return clinics?.find((c) => c.id === realId)?.name || realId || '-';
  }

  // Flexible formatter for vitals entries with several possible shapes
  function formatVitalLine(v: any) {
    // If backend returns a rich vitals object with known fields:
    if (v.height || v.weight || v.bmi || v.hr || v.bp || v.spo2) {
      const parts: string[] = [];
      if (v.height) parts.push(`${v.height}cm`);
      if (v.weight) parts.push(`${v.weight}kg`);
      if (v.bmi) parts.push(`IMC ${Number(v.bmi).toFixed(2)}`);
      if (v.hr) parts.push(`HR ${v.hr}`);
      if (v.bp) parts.push(`BP ${v.bp}`);
      if (v.spo2) parts.push(`SpO2 ${v.spo2}%`);
      return parts.join(', ');
    }

    // If backend returns generic type/value pair
    if (v.type || v.value) {
      const t = v.type ?? 'Signo';
      const val = v.value ?? v.reading ?? '-';
      return `${t}: ${val}`;
    }

    // Fallback: stringify known meaningful properties, else "-"
    const fallbackProps = ['name', 'label', 'measurement', 'result'];
    for (const prop of fallbackProps) {
      if (v[prop]) return `${v[prop]}`;
    }
    return '-';
  }

  async function handleAddNote() {
    if (!encounterId) return;
    const text = newNote.trim();
    if (!text) return;
    setSavingNote(true);
    setError(null);

    const prevEncounter = encounter;

    try {
      // Ask backend to update notes
      await updateEncounter(encounterId, {
        notes: `${prevEncounter?.notes ? prevEncounter.notes + '\n' : ''}${text}`,
      } as any);

      // Re-fetch full encounter to ensure we have complete data including any server-side fields
      const refreshed = await fetchEncounter(encounterId);
      setEncounter(refreshed || null);

      // Re-fetch vitals for this encounter to ensure they are up-to-date and displayed
      if (refreshed?.id) {
        try {
          const vit = await fetchVitals({ encounterId: refreshed.id });
          setVitals(Array.isArray(vit) ? vit : []);
        } catch {
          setVitals([]);
        }
      }

      // Re-fetch appointment context if present
      if (refreshed?.appointmentId) {
        try {
          const appts = await fetchAppointments();
          const found = appts.find(a => a.id === refreshed.appointmentId) || null;
          setAppointment(found);
        } catch {
          // ignore
        }
      }

      setNewNote('');

      // Audit: agregar nota
      createAuditEvent({
        action: 'encounter.add_note',
        entity: 'encounter',
        entityId: encounterId,
        metadata: {
          noteSnippet: text.slice(0, 500),
          noteLength: text.length,
          appointmentId: refreshed?.appointmentId ?? prevEncounter?.appointmentId ?? null,
          patientId: refreshed?.patientId ?? prevEncounter?.patientId ?? null,
        },
      });
    } catch (err: any) {
      setError(String(err?.message || err));
    } finally {
      setSavingNote(false);
    }
  }

  if (!encounterId) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Encuentro</h1>
        <div className="mt-4 text-red-600">Falta ID de encuentro en la ruta.</div>
      </div>
    );
  }

  // Helpers to display reason/diagnosis with sensible fallbacks
  function encounterReason() {
    // Prefer encounter.reason, then appointment.reason, else '-'
    return (encounter?.reason && String(encounter.reason)) ||
      (appointment?.reason && String(appointment.reason)) ||
      '-';
  }
  function encounterDiagnosis() {
    // Prefer encounter.diagnosis, else '-'
    return (encounter?.diagnosis && String(encounter.diagnosis)) || '-';
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Detalle del Encuentro</h1>
          <p className="text-xs text-gray-500">ID: {encounterId}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="px-3 py-1 rounded border bg-white hover:bg-gray-50"
          >
            Volver
          </button>
          <Link
            href={`/dashboard/patients/${(encounter?.patientId || appointment?.patientId) || ''}/record`}
            className="px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700"
          >
            Ver expediente
          </Link>
        </div>
      </div>

      {/* Banner: Solo lectura */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
        Este encuentro fue iniciado. La vista es solo lectura: las acciones de edición están bloqueadas.
      </div>

      {/* Loading / Error */}
      {loading && <div className="text-sm text-gray-500">Cargando encuentro...</div>}
      {error && <div className="text-sm text-red-600">Error: {error}</div>}

      {!loading && !error && !encounter && (
        <div className="text-sm text-gray-500">No se encontró el encuentro.</div>
      )}

      {!loading && encounter && (
        <div className="bg-white border rounded shadow p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500">Paciente</div>
              <div className="font-medium">{findPatientName(encounter.patientId)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Doctor</div>
              <div className="font-medium">{findDoctorName(encounter.doctorId)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Clínica</div>
              <div className="font-medium">{findClinicName(encounter.clinicId)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Fecha</div>
              <div className="font-medium">
                {encounter.startedAt
                  ? new Date(encounter.startedAt).toLocaleString()
                  : encounter.createdAt
                  ? new Date(encounter.createdAt).toLocaleString()
                  : '-'}
              </div>
            </div>
          </div>

          {/* NEW: Motivo y Diagnóstico */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="text-xs text-gray-500">Motivo</div>
              <div className="font-medium">{encounterReason()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Diagnóstico</div>
              <div className="font-medium">{encounterDiagnosis()}</div>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Notas</div>
            <div className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
              {encounter.notes || '-'}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Signos vitales registrados</div>
            {Array.isArray(vitals) && vitals.length > 0 ? (
              <ul className="mt-2 space-y-2 text-sm">
                {vitals
                  .filter((v) => {
                    // remove empty/invalid entries that would render "undefined"
                    if (!v) return false;
                    // consider valid if has at least one meaningful field
                    return (
                      v.height ||
                      v.weight ||
                      v.bmi ||
                      v.hr ||
                      v.bp ||
                      v.spo2 ||
                      v.type ||
                      v.value ||
                      v.recordedAt
                    );
                  })
                  .map((v: any) => {
                    const when = v.recordedAt ? new Date(v.recordedAt).toLocaleString() : null;
                    const line = formatVitalLine(v);
                    return (
                      <li key={v.id ?? `${when}-${line}`} className="py-1">
                        {when ? (
                          <div className="text-[11px] text-gray-600 font-medium">{when}</div>
                        ) : null}
                        <div className="flex justify-between bg-gray-50 p-2 rounded">
                          <div className="text-xs text-gray-600">{/* left column reserved for type */}</div>
                          <div className="font-medium">{line || '-'}</div>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            ) : (
              <div className="mt-2 text-sm text-gray-500">No hay signos vitales registrados.</div>
            )}
          </div>

          {/* Agregar nota (permite añadir notas sin habilitar edición completa) */}
          <div className="pt-2">
            <label className="block text-sm font-medium mb-1">Agregar nota</label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Escribe una nota breve..."
              className="w-full border rounded px-3 py-2 resize-y min-h-[80px]"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setNewNote('')}
                className="px-3 py-1 rounded border text-gray-700 hover:bg-gray-50"
                disabled={savingNote}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddNote}
                className="px-3 py-1 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
                disabled={savingNote || newNote.trim() === ''}
              >
                {savingNote ? 'Guardando...' : 'Agregar nota'}
              </button>
            </div>
            {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
}