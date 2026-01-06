import type { AppointmentEntity } from '@/lib/api/api.appointments';

/**
 * Normaliza un posible id a string o null.
 */
export function normalizeId(v: any): string | null {
  if (!v && v !== 0) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'object') {
    return (
      v.id ??
      v._id ??
      v.userId ??
      v.doctorId ??
      v?.user?.id ??
      null
    ) as string | null;
  }
  return null;
}

/**
 * Candidatos de id que pueden representar al usuario logueado (id, sub, profile, etc).
 */
export function userIdCandidates(user: any): string[] {
  if (!user) return [];
  return [
    normalizeId(user.id),
    normalizeId(user.sub),
    normalizeId(user.userId),
    normalizeId(user.doctorId),
    normalizeId(user.profile?.id),
    normalizeId(user.profile?.doctorId),
  ].filter(Boolean) as string[];
}

/**
 * Extrae un doctorId coherente desde una cita que puede venir en varias formas.
 */
export function appointmentDoctorId(appt: AppointmentEntity | null | undefined): string | null {
  if (!appt) return null;
  return (
    normalizeId((appt as any).doctorId) ||
    normalizeId((appt as any).doctor?.id) ||
    normalizeId((appt as any).doctor?.user?.id) ||
    null
  );
}

/**
 * A partir de doctorsLite y del sessionUser, intenta obtener el id del doctor vinculado a este usuario.
 */
export function doctorIdForSessionUser(doctors: any[] | undefined, sessionUser: any): string | null {
  if (!sessionUser || !doctors) return null;

  const sid =
    normalizeId(sessionUser.id) ||
    normalizeId(sessionUser.sub) ||
    null;

  const semail =
    ((sessionUser?.email || sessionUser?.user?.email || '') as string)
      .toLowerCase?.() ?? null;

  const found = doctors.find((d: any) => {
    const duid =
      normalizeId(d.user?.id) ||
      normalizeId(d.user?.userId) ||
      normalizeId(d.userId) ||
      null;
    const demail =
      (d.user?.email ?? d.email ?? '')?.toLowerCase?.() ?? null;

    if (sid && duid && String(sid) === String(duid)) return true;
    if (semail && demail && semail === demail) return true;
    return false;
  });

  return found?.id ?? null;
}

/**
 * Comprueba si el usuario actual es el doctor asignado a la cita.
 * Usa doctorsLite + sessionUser + la propia cita.
 */
export function isUserAssignedDoctorForAppointment(
  appt: AppointmentEntity | null | undefined,
  doctors: any[] | undefined,
  sessionUser: any,
): boolean {
  if (!appt || !sessionUser) return false;

  // 1) mapping vía tabla de doctores
  const docIdFromUser = doctorIdForSessionUser(doctors, sessionUser);
  if (
    docIdFromUser &&
    appt.doctorId &&
    String(docIdFromUser) === String(appt.doctorId)
  ) {
    return true;
  }

  // 2) fallback: candidatos directos del usuario vs doctorId de la cita
  const candidates = userIdCandidates(sessionUser);
  const apptDoc = appointmentDoctorId(appt);
  if (apptDoc && candidates.some((c) => String(c) === String(apptDoc))) {
    return true;
  }

  return false;
}