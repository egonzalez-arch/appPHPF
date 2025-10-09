'use client';
import { useState, useMemo } from 'react';
import { useAppointmentAudit } from '@/hooks/useAppointmentAudit';

interface Props {
  appointmentId: string | null;
  onClose: () => void;
}

type EventFilter = 'ALL' | 'create' | 'update' | 'status-change' | 'delete';

const ACTION_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  create: { icon: '🟢', color: 'text-green-700', bg: 'bg-green-100' },
  update: { icon: '✏️', color: 'text-blue-700', bg: 'bg-blue-100' },
  'status-change': { icon: '🔄', color: 'text-indigo-700', bg: 'bg-indigo-100' },
  delete: { icon: '🗑️', color: 'text-red-700', bg: 'bg-red-100' },
  default: { icon: '📄', color: 'text-gray-700', bg: 'bg-gray-100' },
};

function relativeTime(dateIso: string) {
  const now = new Date().getTime();
  const then = new Date(dateIso).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return 'hace unos segundos';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `hace ${diffHr} h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `hace ${diffDay} d`;
  return new Date(dateIso).toLocaleDateString();
}

function statusLabel(s?: string) {
  switch (s) {
    case 'PENDING': return 'Pendiente';
    case 'CONFIRMED': return 'Confirmada';
    case 'CANCELLED': return 'Cancelada';
    case 'COMPLETED': return 'Completada';
    default: return s || '-';
  }
}

function humanMessage(ev: any) {
  switch (ev.action) {
    case 'create':
      return 'Cita creada';
    case 'update':
      if (ev.metadataJson?.changes) {
        const keys = Object.keys(ev.metadataJson.changes);
        return `Actualización (${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '…' : ''})`;
      }
      return 'Cita actualizada';
    case 'status-change':
      if (ev.metadataJson?.oldStatus && ev.metadataJson?.newStatus) {
        return `Estado: ${statusLabel(ev.metadataJson.oldStatus)} → ${statusLabel(ev.metadataJson.newStatus)}`;
      }
      return 'Cambio de estado';
    case 'delete':
      return 'Cita eliminada';
    default:
      return ev.action || 'Evento';
  }
}

export function AppointmentAuditModal({ appointmentId, onClose }: Props) {
  const { data, isLoading, isError, error } = useAppointmentAudit(
    appointmentId || undefined,
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<EventFilter>('ALL');
  const [showRaw, setShowRaw] = useState(false);

  if (!appointmentId) return null;

  const filteredEvents = useMemo(() => {
    if (!data) return [];
    if (filter === 'ALL') return data;
    return data.filter(ev => ev.action === filter);
  }, [data, filter]);

  function toggleExpand(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[90]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Historial de la cita
            </h2>
            <p className="text-xs text-gray-500">
              ID: <span className="font-mono">{appointmentId?.slice(0, 12)}...</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 rounded p-1"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="px-5 pt-3 pb-2 flex flex-wrap gap-2 items-center border-b bg-gray-50">
          <span className="text-xs font-medium text-gray-600">Filtrar:</span>
          {(['ALL', 'create', 'update', 'status-change', 'delete'] as EventFilter[]).map(opt => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`text-xs px-3 py-1 rounded border transition ${
                filter === opt
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white hover:bg-teal-50 border-gray-300 text-gray-700'
              }`}
            >
              {opt === 'ALL'
                ? 'Todos'
                : opt === 'status-change'
                ? 'Estado'
                : opt === 'create'
                ? 'Creación'
                : opt === 'update'
                ? 'Actualización'
                : 'Eliminación'}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs text-gray-600">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                checked={showRaw}
                onChange={() => setShowRaw(p => !p)}
              />
              Ver JSON
            </label>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
          {isLoading && <div className="text-sm text-gray-500">Cargando eventos...</div>}
          {isError && (
            <div className="text-sm text-red-600">
              {String(error)}
            </div>
          )}
          {!isLoading && !isError && filteredEvents.length === 0 && (
            <div className="text-sm text-gray-500">
              {filter === 'ALL'
                ? 'No hay eventos registrados.'
                : 'No hay eventos para este filtro.'}
            </div>
          )}

          <ol className="relative border-l border-gray-200 ml-3 space-y-6">
            {filteredEvents.map(ev => {
              const meta = ev.metadataJson || {};
              const actionInfo =
                ACTION_ICONS[ev.action] || ACTION_ICONS['default'];
              const isExpanded = !!expanded[ev.id];
              return (
                <li key={ev.id} className="ml-4">
                  {/* Dot */}
                  <div
                    className={`absolute w-3 h-3 rounded-full -left-[7px] top-2 ring-4 ring-white ${actionInfo.bg}`}
                    title={ev.action}
                  />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded ${actionInfo.bg} ${actionInfo.color}`}
                          >
                            <span>{actionInfo.icon}</span>
                            {humanMessage(ev)}
                          </span>
                          <span
                            className="text-[11px] text-gray-500"
                            title={new Date(ev.createdAt).toLocaleString()}
                          >
                            {relativeTime(ev.createdAt)}
                          </span>
                        </div>

                        {/* Extra contextual info for status changes */}
                        {ev.action === 'status-change' &&
                          meta?.oldStatus &&
                          meta?.newStatus && (
                            <div className="mt-1 text-[11px] flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                {statusLabel(meta.oldStatus)}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-100 text-teal-700">
                                {statusLabel(meta.newStatus)}
                              </span>
                            </div>
                          )}

                        {/* Show list of changed fields (update) */}
                        {ev.action === 'update' &&
                          meta?.changes &&
                          typeof meta.changes === 'object' && (
                            <div className="mt-2">
                              <details
                                open={Object.keys(meta.changes).length <= 2}
                                className="group"
                              >
                                <summary className="cursor-pointer text-[11px] text-gray-600 hover:text-gray-800 select-none">
                                  Cambios ({Object.keys(meta.changes).length})
                                </summary>
                                <ul className="mt-1 ml-2 text-[11px] text-gray-700 list-disc space-y-0.5">
                                  {Object.entries(meta.changes).map(
                                    ([field]) => (
                                      <li key={field}>
                                        <code className="px-1 bg-gray-100 rounded">
                                          {field}
                                        </code>
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </details>
                            </div>
                          )}
                      </div>

                      {meta && Object.keys(meta).length > 0 && showRaw && (
                        <button
                          onClick={() => toggleExpand(ev.id)}
                          className="text-xs text-teal-600 hover:text-teal-700 underline"
                        >
                          {isExpanded ? 'Ocultar' : 'Ver JSON'}
                        </button>
                      )}
                    </div>

                    {showRaw && isExpanded && meta && (
                      <div className="mt-2 border rounded bg-gray-50">
                        <pre className="p-2 text-[10px] overflow-auto max-h-48">
{JSON.stringify(meta, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}