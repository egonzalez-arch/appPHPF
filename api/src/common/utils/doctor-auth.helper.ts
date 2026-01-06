export function getDoctorIdFromAuthUser(authUser: any): string | null {
  if (!authUser) return null;

  // Caso típico: el JWT ya incluye doctorId
  if (authUser.doctorId) return String(authUser.doctorId);

  // Otros posibles campos (por si en algún entorno el payload es distinto)
  if (authUser.doctor?.id) return String(authUser.doctor.id);
  if (authUser.profile?.doctorId) return String(authUser.profile.doctorId);

  return null;
}