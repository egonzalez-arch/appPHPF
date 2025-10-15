'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  fetchEncounters,
  createEncounter,
  EncounterEntity,
} from '@/lib/api/api.encounters';
import {
  fetchVitals,
  createVitals,
  VitalsEntity,
  CreateVitalsInput,
} from '@/lib/api/api.vitals';
import { fetchPatients, Patient } from '@/lib/api/api'; // Reutiliza tu API central
import dynamic from 'next/dynamic';

const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false });
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// Hook para obtener pacientes y helper para nombre
function usePatientsLite() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients()
      .then(setPatients)
      .finally(() => setLoading(false));
  }, []);

  function getPatientName(patientId?: string) {
    if (!patientId) return 'Paciente';
    const p = patients.find(p => p.id === patientId);
    if (p && p.user) return [p.user.firstName, p.user.lastName].filter(Boolean).join(' ');
    if (p && (p.firstName || p.lastName)) return [p.firstName, p.lastName].filter(Boolean).join(' ');
    return patientId;
  }

  return { patients, loading, getPatientName };
}

// Helper para mostrar fecha legible
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

export default function EncountersPage() {
  const router = useRouter();

  const [encounters, setEncounters] = useState<EncounterEntity[]>([]);
  const [selectedEncounter, setSelectedEncounter] = useState<EncounterEntity | null>(null);
  const [vitals, setVitals] = useState<VitalsEntity[]>([]);
  const [loading, setLoading] = useState(false);

  // Vitals form state
  const [formVitals, setFormVitals] = useState<CreateVitalsInput | null>(null);
  const [savingVitals, setSavingVitals] = useState(false);
  const [showVitalsForm, setShowVitalsForm] = useState(false);

  // Vista tabla o calendario
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Hook para pacientes
  const { patients, getPatientName } = usePatientsLite();

  useEffect(() => {
    setLoading(true);
    fetchEncounters()
      .then(setEncounters)
      .finally(() => setLoading(false));
  }, []);

  function handleSelectEncounter(encounter: EncounterEntity) {
    setSelectedEncounter(encounter);
    fetchVitals({ encounterId: encounter.id }).then(setVitals);
    setFormVitals({
      encounterId: encounter.id,
      height: 0,
      weight: 0,
      hr: 0,
      bp: '',
      spo2: 0,
      bmi: undefined,
    });
    setShowVitalsForm(false);
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!formVitals) return;
    const { name, value } = e.target;
    let val: any = value;
    if (['height', 'weight', 'hr', 'spo2'].includes(name)) val = Number(value);
    setFormVitals(prev => ({
      ...prev!,
      [name]: val,
      bmi:
        name === 'height' || name === 'weight'
          ? prev && prev.weight && prev.height
            ? prev.weight / ((prev.height / 100) ** 2)
            : undefined
          : prev?.bmi,
    }));
  }

  async function handleSubmitVitals(e: React.FormEvent) {
    e.preventDefault();
    if (!formVitals) return;
    setSavingVitals(true);
    try {
      // Set recordedAt to system time
      const vitalsPayload = { ...formVitals, recordedAt: new Date().toISOString() };
      await createVitals(vitalsPayload);
      fetchVitals({ encounterId: formVitals.encounterId }).then(setVitals);
      setShowVitalsForm(false);
    } catch (err: any) {
      alert('Error registrando signos vitales: ' + err.message);
    } finally {
      setSavingVitals(false);
    }
  }

  // Eventos para calendario
  const calendarEvents = useMemo(
    () =>
      encounters.map(enc => ({
        id: enc.id,
        title: `${getPatientName(enc.patientId)}${enc.reason ? ' - ' + enc.reason : ''}`,
        start: enc.encounterDate,
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
      })),
    [encounters, patients]
  );

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold">Consultas</h1>
        <div className="flex border rounded overflow-hidden">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-sm ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-600'
            }`}
          >
            Lista
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1 text-sm ${
              viewMode === 'calendar'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-600'
            }`}
          >
            Calendario
          </button>
        </div>
      </div>
      {/* Vista TABLA */}
      {viewMode === 'list' && (
        <>
          {loading ? (
            <div>Cargando...</div>
          ) : (
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Fecha cita</th>
                  <th>Motivo</th>
                  <th>Diagnóstico</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {encounters.map(enc => (
                  <tr key={enc.id}>
                    <td>{getPatientName(enc.patientId)}</td>
                    <td>{formatDate(enc.encounterDate)}</td>
                    <td>{enc.reason}</td>
                    <td>{enc.diagnosis}</td>
                    <td>{enc.status}</td>
                    <td>
                      <button
                        className="px-2 py-1 bg-blue-600 text-white rounded"
                        onClick={() =>
                          router.push(`/dashboard/encounters/manage?encounterId=${enc.id}`)
                        }
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Vista CALENDARIO */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded shadow p-2">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={calendarEvents}
            allDaySlot={false}
            slotMinTime="07:00:00"
            slotMaxTime="21:00:00"
            height="auto"
            eventClick={(info) => {
              const enc = encounters.find(e => e.id === info.event.id);
              if (enc) handleSelectEncounter(enc);
            }}
          />
        </div>
      )}

      {selectedEncounter && (
        <div className="mt-8 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Detalles del encuentro</h2>
          <div>
            <b>Paciente:</b> {getPatientName(selectedEncounter.patientId)}
          </div>
          <div>
            <b>Fecha cita:</b> {formatDate(selectedEncounter.encounterDate)}
          </div>
          <div>
            <b>Motivo:</b> {selectedEncounter.reason}
          </div>
          <div>
            <b>Diagnóstico:</b> {selectedEncounter.diagnosis}
          </div>
          <div>
            <b>Notas:</b> {selectedEncounter.notes}
          </div>
          <div>
            <b>Estado:</b> {selectedEncounter.status}
          </div>
          <hr className="my-4" />
          <h3 className="text-lg font-semibold mb-2">Signos vitales</h3>
          <ul>
            {vitals.length === 0 ? (
              <li className="text-gray-500">No hay signos vitales registrados</li>
            ) : (
              vitals.map(v => (
                <li key={v.id}>
                  <strong>{formatDate(v.recordedAt)}:</strong> {v.height}cm, {v.weight}kg, IMC {v.bmi?.toFixed(2)}, HR {v.hr}, BP {v.bp}, SpO2 {v.spo2}%
                </li>
              ))
            )}
          </ul>
          <button
            className="mt-4 px-3 py-2 rounded bg-green-600 text-white"
            onClick={() => setShowVitalsForm(true)}
          >
            Registrar signos vitales
          </button>
          {showVitalsForm && formVitals && (
            <form className="mt-4 grid gap-3 max-w-lg" onSubmit={handleSubmitVitals}>
              <div>
                <label>Altura (cm):</label>
                <input
                  type="number"
                  name="height"
                  value={formVitals.height}
                  onChange={handleFormChange}
                  className="border px-2 py-1 rounded w-full"
                  required
                />
              </div>
              <div>
                <label>Peso (kg):</label>
                <input
                  type="number"
                  name="weight"
                  value={formVitals.weight}
                  onChange={handleFormChange}
                  className="border px-2 py-1 rounded w-full"
                  required
                />
              </div>
              <div>
                <label>Frecuencia cardíaca (HR):</label>
                <input
                  type="number"
                  name="hr"
                  value={formVitals.hr}
                  onChange={handleFormChange}
                  className="border px-2 py-1 rounded w-full"
                  required
                />
              </div>
              <div>
                <label>Presión arterial (BP):</label>
                <input
                  type="text"
                  name="bp"
                  value={formVitals.bp}
                  onChange={handleFormChange}
                  className="border px-2 py-1 rounded w-full"
                  required
                />
              </div>
              <div>
                <label>Oximetría de pulso (SpO2 %):</label>
                <input
                  type="number"
                  name="spo2"
                  value={formVitals.spo2}
                  onChange={handleFormChange}
                  className="border px-2 py-1 rounded w-full"
                  required
                />
              </div>
              <div>
                <label>IMC (auto):</label>
                <input
                  type="number"
                  name="bmi"
                  value={
                    formVitals.height && formVitals.weight
                      ? (
                          formVitals.weight /
                          ((formVitals.height / 100) ** 2)
                        ).toFixed(2)
                      : ''
                  }
                  readOnly
                  className="border px-2 py-1 rounded w-full bg-gray-200"
                />
              </div>
              {/* Fecha del sistema, no mostrar input de fecha */}
              <button
                type="submit"
                className="mt-4 px-4 py-2 bg-blue-700 text-white rounded"
                disabled={savingVitals}
              >
                {savingVitals ? 'Guardando...' : 'Guardar signos vitales'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}