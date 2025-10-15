'use client';
import { useState, useEffect, useMemo } from 'react';
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
import { fetchAppointments, AppointmentEntity } from '@/lib/api/api.appointments';
import { fetchPatients, Patient } from '@/lib/api/api';
import { fetchUsers, UserEntity } from '@/lib/api/api.users';
import dynamic from 'next/dynamic';

const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false });
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

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
  const [encounters, setEncounters] = useState<EncounterEntity[]>([]);
  const [appointments, setAppointments] = useState<AppointmentEntity[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [selectedEncounter, setSelectedEncounter] = useState<EncounterEntity | null>(null);
  const [vitals, setVitals] = useState<VitalsEntity[]>([]);
  const [loading, setLoading] = useState(false);

  const [formVitals, setFormVitals] = useState<CreateVitalsInput | null>(null);
  const [savingVitals, setSavingVitals] = useState(false);
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Fetch all needed data on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchEncounters(),
      fetchAppointments(),
      fetchPatients(),
      fetchUsers(),
    ])
      .then(([encs, appts, pats, usrs]) => {
        setEncounters(encs);
        setAppointments(appts);
        setPatients(pats);
        setUsers(usrs);
      })
      .finally(() => setLoading(false));
  }, []);

  // Helpers para obtener nombre y fecha
  function getAppointment(appointmentId?: string) {
    return appointments.find(a => a.id === appointmentId);
  }
  function getPatient(patientId?: string) {
    return patients.find(p => p.id === patientId);
  }
  function getUser(userId?: string) {
    return users.find(u => u.id === userId);
  }
  function getPatientDisplay(enc: EncounterEntity) {
    // Encuentra appointment, luego patient, luego user
    const appt = getAppointment(enc.appointmentId);
    const patient = appt ? getPatient(appt.patientId) : undefined;
    const user = patient && patient.user ? getUser(patient.user.id) : undefined;
    if (user) return [user.firstName, user.lastName].filter(Boolean).join(' ');
    return patient?.id || 'Paciente';
  }
  function getAppointmentDate(enc: EncounterEntity) {
    const appt = getAppointment(enc.appointmentId);
    return appt ? formatDate(appt.startAt) : '-';
  }

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

  // Calendar events: show patient name and appointment date
  const calendarEvents = useMemo(
    () =>
      encounters.map(enc => {
        const title = `${getPatientDisplay(enc)}${enc.reason ? ' - ' + enc.reason : ''}`;
        const start = getAppointment(enc.appointmentId)?.startAt;
        return {
          id: enc.id,
          title,
          start,
          backgroundColor: '#3b82f6',
          borderColor: '#3b82f6',
        };
      }),
    [encounters, appointments, patients, users]
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
                    <td>{getPatientDisplay(enc)}</td>
                    <td>{getAppointmentDate(enc)}</td>
                    <td>{enc.reason}</td>
                    <td>{enc.diagnosis}</td>
                    <td>{enc.status}</td>
                    <td>
                      <button
                        className="px-2 py-1 bg-blue-600 text-white rounded"
                        onClick={() => handleSelectEncounter(enc)}
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
            <b>Paciente:</b> {getPatientDisplay(selectedEncounter)}
          </div>
          <div>
            <b>Fecha cita:</b> {getAppointmentDate(selectedEncounter)}
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