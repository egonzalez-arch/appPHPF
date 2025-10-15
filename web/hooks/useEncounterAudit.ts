'use client';

import { useQuery } from '@tanstack/react-query';
import { API_URL } from '@/lib/api/api';

function getCsrf() {
  if (typeof document === 'undefined') return '';
  return (
    document.cookie
      .split('; ')
      .find((r) => r.startsWith('csrf_token='))?.split('=')[1] || ''
  );
}

export type EncounterAuditAction = 'create' | 'update' | 'status-change' | 'delete' | string;

export interface EncounterAuditEvent {
  id: string;
  encounterId: string;
  action: EncounterAuditAction;
  createdAt: string;
  metadataJson?: Record<string, unknown>;
}

export function useEncounterAudit(encounterId?: string) {
  return useQuery<EncounterAuditEvent[]>({
    queryKey: ['encounter-audit', encounterId],
    enabled: !!encounterId,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/encounters/${encounterId}/audit`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'X-CSRF-Token': getCsrf() },
      });

      // Si el backend no tiene este endpoint, trata 404 como "sin historial"
      if (res.status === 404) {
        return [];
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || 'Error al obtener historial del encuentro');
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
}