export type CanonicalRole = 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'PACIENTE' | 'INSURER';

/**
 * Normaliza un rol arbitrario a un rol canónico en MAYÚSCULAS.
 * Añade/ajusta alias según tu BD.
 */
export function normalizeRole(value: unknown): CanonicalRole | null {
  if (!value) return null;
  const v = String(value).trim().toUpperCase();

  switch (v) {
    case 'ADMIN':
    case 'ADMINISTRADOR':
      return 'ADMIN';
    case 'DOCTOR':
      return 'DOCTOR';
    case 'PATIENT':
    case 'PACIENTE':
      return 'PATIENT';
    case 'INSURER':
    case 'ASEGURADORA':
      return 'INSURER';
    default:
      // Fallback permisivo por si tienes otros roles custom
      return v as CanonicalRole;
  }
}

export function normalizeRoles(values: unknown): CanonicalRole[] {
  if (!values) return [];
  if (Array.isArray(values)) {
    const out = new Set<CanonicalRole>();
    for (const r of values) {
      const n = normalizeRole(r);
      if (n) out.add(n);
    }
    return Array.from(out);
  }
  const one = normalizeRole(values);
  return one ? [one] : [];
}