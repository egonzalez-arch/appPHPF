import { useQuery } from '@tanstack/react-query';
import { API_URL } from '@/lib/api/api';

function getCsrf() {
  if (typeof document === 'undefined') return '';
  return (
    document.cookie
      .split('; ')
      .find(r => r.startsWith('csrf_token='))?.split('=')[1] || ''
  );
}

export interface AppointmentAuditEvent {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  metadataJson?: any;
  createdAt: string;
  actorUserId: string;
}

async function fetchAudit(appointmentId: string): Promise<AppointmentAuditEvent[]> {
  const res = await fetch(`${API_URL}/appointments/${appointmentId}/audit`, {
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrf() },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function useAppointmentAudit(appointmentId?: string) {
  return useQuery<AppointmentAuditEvent[], Error>({
    queryKey: ['appointment-audit', appointmentId],
    queryFn: () => fetchAudit(appointmentId!),
    enabled: !!appointmentId,
    staleTime: 10_000,
  });
}