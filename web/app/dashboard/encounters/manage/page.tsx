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

export default function ManageEncounterPage() {
  const router = useRouter();
  const search = useSearchParams();
  const encounterId = search.get('encounterId');
  const appointmentId = search.get('appointmentId');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [encounter, setEncounter] = useState<EncounterEntity | null>(null);
  const [vitals, setVitals] = useState<VitalsEntity[]>([]);
  const [appointments, setAppointments] = useState<AppointmentEntity[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  // Form Encounter
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

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        // Load base data
        const [appts, pats] = await Promise.all([
          fetchAppointments(), // list to resolve relations
          fetchPatients(),
        ]);
        if (!mounted) return;
        setAppointments(appts);
        setPatients(pats);

        if (encounterId) {
          const enc = await fetchEncounter(encounterId);
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
          // starting a new encounter from appointmentId
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
    if (!appointment && !encounter) return;
    setSaving(true);
    try {
      if (encounter) {
        const updated = await updateEncounter(encounter.id, { reason, diagnosis, notes, status });
        setEncounter(updated);
      } else if (appointmentId) {
        const created = await createEncounter({
          appointmentId,
          encounterDate: new Date().toISOString(),
          reason,
          diagnosis,
          notes,
          status,
        });
        setEncounter(created);
      }
    } catch (e: any) {
      alert(e?.message || 'Error guardando encuentro');
    } finally {
      setSaving(false);
    }
  }

  async function addVitals() {
    if (!encounter?.id) {
      alert('Primero guarda el encuentro.');
      return;
    }
    if (
      vHeight === '' || vWeight === '' || vHR === '' || vBP.trim() === '' || vSpO2 === ''
    ) {
      alert('Completa todos los campos de signos vitales.');
      return;
    }
    try {
      const bmi = Number(vWeight) / ((Number(vHeight) / 100) ** 2);
      await createVitals({
        encounterId: encounter.id,
        height: Number(vHeight),
        weight: Number(vWeight),
        hr: Number(vHR),
        bp: vBP,
        spo2: Number(vSpO2),
        bmi,
        recordedAt: new Date().toISOString(),
      });
      const vit = await fetchVitals({ encounterId: encounter.id });
      setVitals(vit);

      // reset minimal vital fields
      setVHR('');
      setVBP('');
      setVSpO2('');
      // keep height/weight to ease repeated measurements if desired
    } catch (e: any) {
      alert(e?.message || 'Error guardando signos vitales');
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
          onClick={() => router.back()}
        >
          Volver
        </button>
      </div>

      {/* Encabezado contexto */}
      <div className="bg-white rounded border p-4">
        {loading ? (
          <div>Cargando...</div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="font-medium">Paciente:</span>{' '}
                {patientName || '-'}
              </div>
              <div>
                <span className="font-medium">Fecha de cita:</span>{' '}
                {formatDate(appointment?.startAt)}
              </div>
              <div>
                <span className="font-medium">Estado encuentro:</span>{' '}
                {encounter?.status || status}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Form Encuentro (sin botón aquí) */}
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
              onChange={(e) => setStatus(e.target.value as EncounterStatus)}
            >
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

        {/* Lista */}
        <ul className="text-sm mb-4">
          {vitals.length === 0 ? (
            <li className="text-gray-500">No hay signos vitales registrados</li>
          ) : (
            vitals.map(v => (
              <li key={v.id} className="py-1">
                <strong>{formatDate(v.recordedAt)}:</strong>{' '}
                {v.height}cm, {v.weight}kg, IMC {v.bmi?.toFixed(2)}, HR {v.hr}, BP {v.bp}, SpO2 {v.spo2}%
              </li>
            ))
          )}
        </ul>

        {/* Form agregar */}
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium">Altura (cm)</label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              value={vHeight}
              onChange={(e) => setVHeight(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="170"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Peso (kg)</label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              value={vWeight}
              onChange={(e) => setVWeight(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="70"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">IMC (auto)</label>
            <input
              disabled
              className="border rounded px-3 py-2 w-full bg-gray-100"
              value={
                vHeight && vWeight
                  ? (Number(vWeight) / ((Number(vHeight) / 100) ** 2)).toFixed(2)
                  : ''
              }
              placeholder="—"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Frecuencia cardiaca (HR)</label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              value={vHR}
              onChange={(e) => setVHR(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="72"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Presión arterial (BP)</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={vBP}
              onChange={(e) => setVBP(e.target.value)}
              placeholder="120/80"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">SpO2 (%)</label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              value={vSpO2}
              onChange={(e) => setVSpO2(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="98"
            />
          </div>
        </div>
        <div className="pt-4">
          <button
            onClick={addVitals}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Guardar signos vitales
          </button>
        </div>
      </div>

      {/* Botones finales: Cancelar y Guardar Cambios */}
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
          {saving ? 'Guardando...' : encounter ? 'Guardar cambios' : 'Crear encuentro'}
        </button>
      </div>
    </div>
  );
}