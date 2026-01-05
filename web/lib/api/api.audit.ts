// web/lib/api/api.audit.ts
export type CreateAuditEventPayload = {
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, any> | null;
  userId?: string | null;
  actorUserId?: string | null;
  timestamp?: string | null;
  description?: string | null;
};

function getApiBase(): string {
  if (typeof window === 'undefined') return '';
  const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  return base || '';
}

function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(^|;\s*)csrf_token=([^;]+)/);
  return m ? decodeURIComponent(m[2]) : null;
}

function isoWithoutMillisFromDate(d: Date): string {
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function normalizeTimestampIfValid(raw?: string | null): string | null {
  if (!raw) return null;
  const parsed = new Date(raw);
  if (isNaN(parsed.getTime())) return null;
  return isoWithoutMillisFromDate(parsed);
}

/**
 * createAuditEvent - intento seguro de enviar evento de auditoría.
 * - Devuelve true si 2xx, false si falla.
 * - No lanza.
 * - Caller debe usar fire-and-forget: void createAuditEvent(...)
 */
export async function createAuditEvent(payload: CreateAuditEventPayload): Promise<boolean> {
  const base = getApiBase();
  const url = base ? `${base}/audit-events` : '/api/audit-events';

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const csrf = getCsrfTokenFromCookie();
    if (csrf) headers['X-CSRF-Token'] = csrf;

    // Normalize timestamp if caller provided a valid one; otherwise generate one and include it,
    // because backend expects timestamp.
    const normalizedProvidedTs = normalizeTimestampIfValid(payload.timestamp ?? null);
    const ts = normalizedProvidedTs ?? isoWithoutMillisFromDate(new Date());

    // Build body: only include userId/actorUserId if truthy to avoid sending nulls.
    const body: Record<string, any> = {
      timestamp: ts,
      description: payload.description ?? payload.action,
      action: payload.action,
      entity: payload.entity,
      entityId: payload.entityId ?? null,
      metadataJson: payload.metadata ?? null,
    };

    if (payload.userId) body.userId = payload.userId;
    if (payload.actorUserId) body.actorUserId = payload.actorUserId;

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('createAuditEvent -> POST', url, headers, body);
    }

    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      if (process.env.NODE_ENV !== 'production') {
        const text = await res.text().catch(() => '');
        // eslint-disable-next-line no-console
        console.warn('Audit event failed', res.status, text);
      }
      return false;
    }

    return true;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Audit event network error', err);
    }
    return false;
  }
}