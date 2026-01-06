'use client';
import { useRouter } from 'next/navigation';
import { useAppointmentAudit } from '@/hooks/useAppointmentAudit';
import { AppointmentEntity, AppointmentStatus } from '@/lib/api/api.appointments';
import { useDoctorsLite } from '@/hooks/useDoctorsLite';
import { usePatientsLite } from '@/hooks/usePatientsLite';
import { useClinicsLite } from '@/hooks/useClinicsLite';

interface Props {
  appointment: AppointmentEntity | null;
  onClose: () => void;
  onEdit: (appt: AppointmentEntity) => void;
  onChangeStatus: (appt: AppointmentEntity, status: AppointmentStatus) => void;
  loadingStatus?: boolean;

  // CTA para abrir la gestión de encuentro (iniciar/actualizar)
  onOpenEncounter?: (appt: AppointmentEntity) => void;
  encounterCtaLabel?: string; // 'Iniciar encuentro' | 'Ver detalle'
}

export function AppointmentHistoryPanel({
  appointment,
  onClose,
  onEdit,
  onChangeStatus,
  loadingStatus,
  onOpenEncounter,
  encounterCtaLabel = 'Iniciar encuentro',
}: Props) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useAppointmentAudit(
    appointment?.id || undefined,
  );

  // Cargar catálogos "lite" para mostrar nombres amigables
  const { data: doctors } = useDoctorsLite(true);
  const { data: patients } = usePatientsLite(true);
  const { data: clinics } = useClinicsLite(true);

  if (!appointment) return null;

  function labelStatus(s: string) {
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

  function clinicName(id: string) {
    return clinics?.find((c) => c.id === id)?.name || id;
  }

  function doctorName(id: string) {
    const d = doctors?.find((x) => x.id === id);
    const full = [d?.user?.firstName, d?.user?.lastName]
      .filter(Boolean)
      .join(' ');
    return full || id;
  }

  function patientName(id: string) {
    const p = patients?.find((x) => x.id === id);
    const full = [p?.user?.firstName, p?.user?.lastName]
      .filter(Boolean)
      .join(' ');
    return full || id;
  }

  function humanEvent(e: any) {
    if (!e) return '';
    const { action, metadataJson } = e;
    if (action === 'create') return 'Cita creada';
    if (action === 'update') return 'Cita actualizada';
    if (action === 'delete') return 'Cita eliminada';
    if (action === 'status-change') {
      if (metadataJson?.oldStatus && metadataJson?.newStatus) {
        return `Estado: ${labelStatus(
          metadataJson.oldStatus,
        )} → ${labelStatus(metadataJson.newStatus)}`;
      }
      return 'Cambio de estado';
    }
    return action;
  }

  return (
    <div className="fixed inset-0 z-[85] flex">
      <div
        className="flex-1 bg-black/40"
        onClick={() => onClose()}
        aria-label="Cerrar panel"
      />
      <div className="w-full max-w-md bg-white shadow-xl h-full flex flex-col">
        <div className="p-4 border-b flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Detalles de la Cita</h2>
            <p className="text-xs text-gray-500">
              ID: {appointment.id.slice(0, 8)}...
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3 text-sm overflow-y-auto">
          <div>
            <span className="font-medium">Clínica:</span>{' '}
            {clinicName(appointment.clinicId)}
          </div>
          <div>
            <span className="font-medium">Doctor:</span>{' '}
            {doctorName(appointment.doctorId)}
          </div>
          <div>
            <span className="font-medium">Paciente:</span>{' '}
            {patientName(appointment.patientId)}
          </div>
          <div>
            <span className="font-medium">Inicio:</span>{' '}
            {new Date(appointment.startAt).toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Fin:</span>{' '}
            {new Date(appointment.endAt).toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Estado:</span>{' '}
            <span className="inline-block px-2 py-0.5 rounded bg-teal-100 text-teal-700">
              {labelStatus(appointment.status)}
            </span>
          </div>
          <div>
            <span className="font-medium">Motivo:</span>{' '}
            {appointment.reason || '-'}
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={() => onEdit(appointment)}
              className="px-3 py-1 text-sm rounded bg-teal-600 text-white hover:bg-teal-700"
            >
              Editar
            </button>

            {/* Combobox con confirmación */}
            <select
              disabled={loadingStatus}
              value=""
              className="px-2 py-1 border rounded text-sm bg-white"
              onChange={(e) => {
                const v = e.target.value as AppointmentStatus;
                if (!v) return;

                let message = '';
                switch (v) {
                  case 'PENDING':
                    message =
                      '¿Deseas marcar la cita como Pendiente?';
                    break;
                  case 'CONFIRMED':
                    message =
                      '¿Deseas marcar la cita como Confirmada?';
                    break;
                  case 'CANCELLED':
                    message =
                      '¿Deseas cancelar esta cita?';
                    break;
                  case 'COMPLETED':
                    message =
                      '¿Deseas marcar esta cita como Completada?';
                    break;
                  default:
                    message = `¿Deseas cambiar el estado de la cita a "${v}"?`;
                }

                const ok = window.confirm(message);
                if (!ok) {
                  e.target.value = '';
                  return;
                }

                onChangeStatus(appointment, v);
                e.target.value = '';
              }}
            >
              <option value="">Cambiar estado</option>
              <option value="PENDING">Pendiente</option>
              <option value="CONFIRMED">Confirmada</option>
              <option value="CANCELLED">Cancelada</option>
              <option value="COMPLETED">Completada</option>
            </select>

            {/* Botón Iniciar encuentro con confirmación */}
            {onOpenEncounter && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      '¿Deseas iniciar el encuentro para esta cita?',
                    )
                  ) {
                    onOpenEncounter(appointment);
                  }
                }}
                className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                {encounterCtaLabel}
              </button>
            )}

            <button
              onClick={() =>
                router.push(
                  `/dashboard/patients/${appointment.patientId}/record`,
                )
              }
              className="px-3 py-1 text-sm rounded bg-purple-600 text-white hover:bg-purple-700"
            >
              Ver expediente
            </button>
          </div>

          <hr className="my-3" />

          <h3 className="font-semibold">Historial</h3>
          {isLoading && <div>Cargando...</div>}
          {isError && (
            <div className="text-red-600 text-xs">
              {String(error)}
            </div>
          )}
          {!isLoading && data?.length === 0 && (
            <div className="text-gray-500 text-xs">Sin eventos.</div>
          )}
          <ol className="relative border-l border-gray-200 ml-2">
            {data?.map((ev) => (
              <li key={ev.id} className="mb-4 ml-4">
                <div className="absolute w-2 h-2 bg-teal-500 rounded-full -left-1.5 top-1" />
                <time className="block text-[11px] text-gray-500">
                  {new Date(ev.createdAt).toLocaleString()}
                </time>
                <div className="text-xs font-medium">
                  {humanEvent(ev)}{' '}
                  {ev.metadataJson?.reason && (
                    <span className="text-gray-500">
                      (Motivo: {ev.metadataJson.reason})
                    </span>
                  )}
                </div>
                {ev.metadataJson?.changes && (
                  <pre className="mt-1 bg-gray-50 border text-[10px] p-2 rounded overflow-x-auto">
{JSON.stringify(ev.metadataJson.changes, null, 2)}
                  </pre>
                )}
                {ev.metadataJson?.oldStatus &&
                  ev.metadataJson?.newStatus && (
                    <div className="text-[11px] text-gray-600 mt-1">
                      {labelStatus(ev.metadataJson.oldStatus)} →{' '}
                      {labelStatus(ev.metadataJson.newStatus)}
                    </div>
                  )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}