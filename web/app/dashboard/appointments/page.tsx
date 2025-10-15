'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
  useUpdateAppointmentStatus,
  AppointmentEntity,
  AppointmentStatus,
} from '@/hooks/useAppointments';
import { useDoctorsLite } from '@/hooks/useDoctorsLite';
import { usePatientsLite } from '@/hooks/usePatientsLite';
import { useClinicsLite } from '@/hooks/useClinicsLite';
import AppointmentForm from '@/components/forms/AppointmentForm';
import { AppointmentCalendar } from '@/components/appointments/AppointmentCalendar';
import { AppointmentAuditModal } from '@/components/appointments/AppointmentAuditModal';
import { useRouter } from 'next/navigation';

// NUEVO: para detectar si ya hay encuentro asociado a la cita
import { fetchEncounters, EncounterEntity as Encounter } from '@/lib/api/api.encounters';

type PendingCreate = {
  clinicId: string;
  patientId: string;
  doctorId: string;
  startAt: string;
  endAt: string;
  reason: string;
};

export default function AppointmentsPage() {
  const router = useRouter();
  const { user: sessionUser } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editAppt, setEditAppt] = useState<AppointmentEntity | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AppointmentEntity | null>(null);

  const [showConfirmCreate, setShowConfirmCreate] = useState(false);
  const [pendingCreateData, setPendingCreateData] = useState<PendingCreate | null>(null);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState<AppointmentEntity | null>(null);
  const [newStatus, setNewStatus] = useState<AppointmentStatus>('CONFIRMED');

  const [auditApptId, setAuditApptId] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [doctorFilter, setDoctorFilter] = useState('');
  const [patientFilter, setPatientFilter] = useState('');
  const [clinicFilter, setClinicFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rawSearch, setRawSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Prefill times for create (when coming from calendar selection)
  const [prefillStart, setPrefillStart] = useState<Date | null>(null);
  const [prefillEnd, setPrefillEnd] = useState<Date | null>(null);

  // NUEVO: mapa de encuentros por appointmentId para decidir CTA (Iniciar/Actualizar)
  const [encountersByAppt, setEncountersByAppt] = useState<Record<string, Encounter>>({});

  const debounced = useDebouncedValue(rawSearch, 300);
  const search = debounced.trim().toLowerCase();

  const filters = useMemo(
    () => ({
      doctorId: doctorFilter || undefined,
      patientId: patientFilter || undefined,
      clinicId: clinicFilter || undefined,
      status: statusFilter as AppointmentStatus || undefined,
    }),
    [doctorFilter, patientFilter, clinicFilter, statusFilter],
  );

  const { data: appointments, isLoading, isError, error } = useAppointments(filters);
  const { data: doctors } = useDoctorsLite(true);
  const { data: patients } = usePatientsLite(true);
  const { data: clinics } = useClinicsLite(true);

  const createMut = useCreateAppointment();
  const updateMut = useUpdateAppointment();
  const deleteMut = useDeleteAppointment();
  const statusMut = useUpdateAppointmentStatus();

  const filtered = useMemo(() => {
    if (!appointments) return [];
    if (!search) return appointments;
    return appointments.filter((a) =>
      [a.reason, a.doctorId, a.patientId, a.clinicId, a.status]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(search)),
    );
  }, [appointments, search]);

  const submitting =
    createMut.isPending ||
    updateMut.isPending ||
    deleteMut.isPending ||
    statusMut.isPending;

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 3500);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  // NUEVO: cargar encuentros para mapear por appointmentId
  useEffect(() => {
    fetchEncounters()
      .then((list) => {
        const map: Record<string, Encounter> = {};
        for (const e of list) {
          if (e.appointmentId) map[e.appointmentId] = e;
        }
        setEncountersByAppt(map);
      })
      .catch(() => {});
  }, []);

  function handleSubmit(data: any) {
    if (editAppt) {
      updateMut.mutate(
        { id: editAppt.id, data },
        {
          onSuccess: () => {
            setShowForm(false);
            setEditAppt(null);
            setPrefillStart(null);
            setPrefillEnd(null);
            setSuccessMessage('Cita actualizada.');
          },
        },
      );
    } else {
      setPendingCreateData(data);
      setShowConfirmCreate(true);
    }
  }

  function confirmCreate() {
    if (!pendingCreateData) return;
    createMut.mutate(pendingCreateData, {
      onSuccess: () => {
        setShowConfirmCreate(false);
        setPendingCreateData(null);
        setShowForm(false);
        setEditAppt(null);
        setPrefillStart(null);
        setPrefillEnd(null);
        setSuccessMessage('Cita creada correctamente.');
      },
    });
  }

  function cancelCreateConfirmation() {
    if (createMut.isPending) return;
    setShowConfirmCreate(false);
    setPendingCreateData(null);
  }

  function openStatusModal(appt: AppointmentEntity) {
    setStatusTarget(appt);
    setNewStatus('CONFIRMED');
    setShowStatusModal(true);
  }

  function applyStatusChange() {
    if (!statusTarget) return;
    statusMut.mutate(
      { id: statusTarget.id, status: newStatus },
      {
        onSuccess: () => {
          setShowStatusModal(false);
          setStatusTarget(null);
          setSuccessMessage('Estado actualizado.');
        },
      },
    );
  }

  function labelForStatus(s: string) {
    switch (s) {
      case 'PENDING':
        return 'Pendiente';
      case 'CONFIRMED':
        return 'Confirmada';
      case 'CANCELLED':
        return 'Cancelada';
      case 'COMPLETED':
        return 'Completada';
      default:
        return s;
    }
  }

  function shortDate(iso?: string) {
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

  function findDoctorName(id: string) {
    const d = doctors?.find((x) => x.id === id);
    const full = [d?.user?.firstName, d?.user?.lastName].filter(Boolean).join(' ');
    return full || id;
  }

  function findPatientName(id: string) {
    const p = patients?.find((x) => x.id === id);
    const full = [p?.user?.firstName, p?.user?.lastName].filter(Boolean).join(' ');
    return full || id;
  }

  function findClinicName(id: string) {
    return clinics?.find((c) => c.id === id)?.name || id;
  }

  function handleCreateFromCalendar(start: Date, end: Date) {
    setPrefillStart(start);
    setPrefillEnd(end);
    setEditAppt(null);
    setShowForm(true);
  }

  function handleSoftFail(msg: string) {
    setSuccessMessage(msg);
  }

  // NUEVO: CTA de Encuentro que navega a la página de gestión
  function renderEncounterCTA(appt: AppointmentEntity) {
    const enc = encountersByAppt[appt.id];
    if (enc) {
      return (
        <button
          className="px-3 py-1 rounded bg-amber-600 text-white hover:bg-amber-700 shadow"
          disabled={submitting}
          onClick={() => router.push(`/dashboard/encounters/manage?encounterId=${enc.id}`)}
        >
          Actualizar encuentro
        </button>
      );
    }
    return (
      <button
        className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 shadow"
        disabled={submitting}
        onClick={() => router.push(`/dashboard/encounters/manage?appointmentId=${appt.id}`)}
      >
        Iniciar encuentro
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Encabezado */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Citas</h1>
          <div className="flex border rounded overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'list'
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-teal-600'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'calendar'
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-teal-600'
              }`}
            >
              Calendario
            </button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-3 w-full lg:w-auto lg:items-center">
          <div className="relative flex-1 min-w-[220px]">
            <input
              value={rawSearch}
              onChange={(e) => setRawSearch(e.target.value)}
              placeholder="Buscar (motivo, IDs...)"
              className="w-full border rounded px-3 py-2 pr-9 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {rawSearch && (
              <button
                type="button"
                onClick={() => setRawSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="border px-3 py-2 rounded bg-white"
          >
            <option value="">Todos Doctores</option>
            {doctors?.map((d) => {
              const full = [d.user?.firstName, d.user?.lastName]
                .filter(Boolean)
                .join(' ');
              return (
                <option key={d.id} value={d.id}>
                  {full || d.id}
                </option>
              );
            })}
          </select>

          <select
            value={patientFilter}
            onChange={(e) => setPatientFilter(e.target.value)}
            className="border px-3 py-2 rounded bg-white"
          >
            <option value="">Todos Pacientes</option>
            {patients?.map((p) => {
              const full = [p.user?.firstName, p.user?.lastName]
                .filter(Boolean)
                .join(' ');
              return (
                <option key={p.id} value={p.id}>
                  {full || p.id}
                </option>
              );
            })}
          </select>

          <select
            value={clinicFilter}
            onChange={(e) => setClinicFilter(e.target.value)}
            className="border px-3 py-2 rounded bg-white"
          >
            <option value="">Todas Clínicas</option>
            {clinics?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-2 rounded bg-white"
          >
            <option value="">Todos Estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmada</option>
            <option value="CANCELLED">Cancelada</option>
            <option value="COMPLETED">Completada</option>
          </select>

          {viewMode === 'list' && (
            <button
              className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 shadow"
              disabled={submitting}
              onClick={() => {
                setEditAppt(null);
                setPrefillStart(null);
                setPrefillEnd(null);
                setShowForm(true);
              }}
            >
              ➕ Nueva Cita
            </button>
          )}
        </div>
      </div>

      {/* Mensajes */}
      {!sessionUser && <div>Inicia sesión para ver citas.</div>}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded text-sm">
          {successMessage}
        </div>
      )}
      {isLoading && <div>Cargando citas...</div>}
      {isError && <div className="text-red-600">Error: {String(error)}</div>}

      {createMut.isError && (
        <div className="text-red-600">
          Error al crear: {(createMut.error as any)?.message}
        </div>
      )}
      {updateMut.isError && (
        <div className="text-red-600">
          Error al actualizar: {(updateMut.error as any)?.message}
        </div>
      )}
      {deleteMut.isError && (
        <div className="text-red-600">
          Error al eliminar: {(deleteMut.error as any)?.message}
        </div>
      )}
      {statusMut.isError && (
        <div className="text-red-600">
          Error al cambiar estado: {(statusMut.error as any)?.message}
        </div>
      )}

      {viewMode === 'list' && (
        <>
          {/* Tabla Desktop */}
          <div className="hidden md:block bg-white rounded shadow border overflow-x-auto">
            <table className="min-w-max w-full">
              <thead>
                <tr className="bg-teal-100">
                  <th className="px-4 py-2 border-b">Clínica</th>
                  <th className="px-4 py-2 border-b">Doctor</th>
                  <th className="px-4 py-2 border-b">Paciente</th>
                  <th className="px-4 py-2 border-b">Inicio</th>
                  <th className="px-4 py-2 border-b">Fin</th>
                  <th className="px-4 py-2 border-b">Estado</th>
                  <th className="px-4 py-2 border-b">Motivo</th>
                  <th className="px-4 py-2 border-b">Encuentro</th>
                  <th className="px-4 py-2 border-b">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">
                      {search ||
                      doctorFilter ||
                      patientFilter ||
                      clinicFilter ||
                      statusFilter
                        ? 'No se encontraron citas.'
                        : 'No hay citas.'}
                    </td>
                  </tr>
                )}
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-teal-50">
                    <td className="px-4 py-2">{findClinicName(a.clinicId)}</td>
                    <td className="px-4 py-2">{findDoctorName(a.doctorId)}</td>
                    <td className="px-4 py-2">{findPatientName(a.patientId)}</td>
                    <td className="px-4 py-2">{shortDate(a.startAt)}</td>
                    <td className="px-4 py-2">{shortDate(a.endAt)}</td>
                    <td className="px-4 py-2">
                      <span className="text-sm px-2 py-1 rounded bg-teal-100 text-teal-800">
                        {labelForStatus(a.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2">{a.reason || '-'}</td>
                    <td className="px-4 py-2">
                      {renderEncounterCTA(a)}
                    </td>
                    <td className="px-4 py-2 flex gap-2 flex-wrap">
                      <button
                        className="text-teal-600 hover:underline"
                        disabled={submitting}
                        onClick={() => {
                          setEditAppt(a);
                          setPrefillStart(null);
                          setPrefillEnd(null);
                          setShowForm(true);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="text-indigo-600 hover:underline"
                        disabled={submitting}
                        onClick={() => openStatusModal(a)}
                      >
                        Estado
                      </button>
                      <button
                        className="text-gray-600 hover:underline"
                        disabled={submitting}
                        onClick={() => setAuditApptId(a.id)}
                      >
                        Historial
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        disabled={submitting}
                        onClick={() => setConfirmDelete(a)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Móvil */}
          <div className="md:hidden flex flex-col gap-4">
            {filtered.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {search ||
                doctorFilter ||
                patientFilter ||
                clinicFilter ||
                statusFilter
                  ? 'No se encontraron citas.'
                  : 'No hay citas.'}
              </div>
            )}
            {filtered.map((a) => {
              const enc = encountersByAppt[a.id];
              return (
                <div
                  key={a.id}
                  className="border rounded shadow p-4 bg-white space-y-2"
                >
                  <div className="font-semibold text-lg">
                    {findClinicName(a.clinicId)}
                  </div>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div>
                      <span className="font-medium">Doctor:</span>{' '}
                      {findDoctorName(a.doctorId)}
                    </div>
                    <div>
                      <span className="font-medium">Paciente:</span>{' '}
                      {findPatientName(a.patientId)}
                    </div>
                    <div>
                      <span className="font-medium">Inicio:</span>{' '}
                      {shortDate(a.startAt)}
                    </div>
                    <div>
                      <span className="font-medium">Fin:</span>{' '}
                      {shortDate(a.endAt)}
                    </div>
                    <div>
                      <span className="font-medium">Estado:</span>{' '}
                      {labelForStatus(a.status)}
                    </div>
                    <div>
                      <span className="font-medium">Motivo:</span>{' '}
                      {a.reason || '-'}
                    </div>
                  </div>
                  {/* CTA destacado en móvil */}
                  <div className="pt-2">
                    {enc ? (
                      <button
                        className="w-full px-3 py-2 rounded bg-amber-600 text-white hover:bg-amber-700 shadow"
                        disabled={submitting}
                        onClick={() => router.push(`/dashboard/encounters/manage?encounterId=${enc.id}`)}
                      >
                        Actualizar encuentro
                      </button>
                    ) : (
                      <button
                        className="w-full px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 shadow"
                        disabled={submitting}
                        onClick={() => router.push(`/dashboard/encounters/manage?appointmentId=${a.id}`)}
                      >
                        Iniciar encuentro
                      </button>
                    )}
                  </div>
                  <div className="flex gap-4 mt-2 flex-wrap">
                    <button
                      className="text-teal-600 hover:underline"
                      onClick={() => {
                        setEditAppt(a);
                        setShowForm(true);
                        setPrefillStart(null);
                        setPrefillEnd(null);
                      }}
                      disabled={submitting}
                    >
                      Editar
                    </button>
                    <button
                      className="text-indigo-600 hover:underline"
                      onClick={() => openStatusModal(a)}
                      disabled={submitting}
                    >
                      Estado
                    </button>
                    <button
                      className="text-gray-600 hover:underline"
                      onClick={() => setAuditApptId(a.id)}
                      disabled={submitting}
                    >
                      Historial
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => setConfirmDelete(a)}
                      disabled={submitting}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {viewMode === 'calendar' && (
        <div className="bg-white rounded shadow border p-2">
          <AppointmentCalendar
            appointments={filtered}
            onCreateFromRange={handleCreateFromCalendar}
            onEdit={(a) => {
              setEditAppt(a);
              setShowForm(true);
              setPrefillStart(null);
              setPrefillEnd(null);
            }}
            onSoftFail={handleSoftFail}
          />
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-3xl w-full">
            <AppointmentForm
              mode={editAppt ? 'edit' : 'create'}
              initialAppointment={editAppt || undefined}
              submitting={submitting || createMut.isPending}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditAppt(null);
                setPendingCreateData(null);
                setShowConfirmCreate(false);
                setPrefillStart(null);
                setPrefillEnd(null);
              }}
              allowChangeRelationsOnEdit={true}
              existingAppointments={appointments || []}
              prefillStart={prefillStart}
              prefillEnd={prefillEnd}
            />
          </div>
        </div>
      )}

      {/* Modal confirm creation */}
      {showConfirmCreate && pendingCreateData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded shadow p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-semibold">Confirmar creación de cita</h2>
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-medium">Clínica:</span>{' '}
                {findClinicName(pendingCreateData.clinicId)}
              </p>
              <p>
                <span className="font-medium">Doctor:</span>{' '}
                {findDoctorName(pendingCreateData.doctorId)}
              </p>
              <p>
                <span className="font-medium">Paciente:</span>{' '}
                {findPatientName(pendingCreateData.patientId)}
              </p>
              <p>
                <span className="font-medium">Inicio:</span>{' '}
                {shortDate(pendingCreateData.startAt)}
              </p>
              <p>
                <span className="font-medium">Fin:</span>{' '}
                {shortDate(pendingCreateData.endAt)}
              </p>
              <p>
                <span className="font-medium">Motivo:</span>{' '}
                {pendingCreateData.reason}
              </p>
            </div>
            {createMut.isError && (
              <div className="text-red-600 text-sm">
                {(createMut.error as any)?.message || 'Error al crear'}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={cancelCreateConfirmation}
                className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
                disabled={createMut.isPending}
              >
                Cancelar
              </button>
              <button
                onClick={confirmCreate}
                disabled={createMut.isPending}
                className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {createMut.isPending ? 'Creando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Status */}
      {showStatusModal && statusTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[65]">
          <div className="bg-white rounded shadow p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-semibold">Cambiar estado de la cita</h2>
            <div className="text-sm">
              <p>
                <span className="font-medium">Actual:</span>{' '}
                {labelForStatus(statusTarget.status)}
              </p>
            </div>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as AppointmentStatus)}
              className="border px-3 py-2 rounded w-full bg-white"
              disabled={statusMut.isPending}
            >
              <option value="PENDING">Pendiente</option>
              <option value="CONFIRMED">Confirmada</option>
              <option value="CANCELLED">Cancelada</option>
              <option value="COMPLETED">Completada</option>
            </select>
            {statusMut.isError && (
              <div className="text-red-600 text-sm">
                {(statusMut.error as any)?.message ||
                  'Error al cambiar estado'}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  if (statusMut.isPending) return;
                  setShowStatusModal(false);
                  setStatusTarget(null);
                }}
                className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
                disabled={statusMut.isPending}
              >
                Cancelar
              </button>
              <button
                onClick={applyStatusChange}
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                disabled={statusMut.isPending}
              >
                {statusMut.isPending ? 'Guardando...' : 'Aplicar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
          <div className="bg-white rounded shadow p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-semibold">Eliminar cita</h2>
            <p className="text-sm text-gray-700">
              ¿Seguro que deseas eliminar la cita de{' '}
              <span className="font-medium">
                {findPatientName(confirmDelete.patientId)}
              </span>{' '}
              con el Dr./Dra.{' '}
              <span className="font-medium">
                {findDoctorName(confirmDelete.doctorId)}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
                disabled={deleteMut.isPending}
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  deleteMut.mutate(
                    { id: confirmDelete.id },
                    {
                      onSuccess: () => {
                        setConfirmDelete(null);
                        setSuccessMessage('Cita eliminada.');
                      },
                    },
                  )
                }
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                disabled={deleteMut.isPending}
              >
                {deleteMut.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Audit (solo para modo lista) */}
      {auditApptId && viewMode === 'list' && (
        <AppointmentAuditModal
          appointmentId={auditApptId}
          onClose={() => setAuditApptId(null)}
        />
      )}
    </div>
  );
}