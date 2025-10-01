import {
  fetchDoctors,
  createDoctorWithUser,
  createDoctorOnly,
  updateDoctor,
  disableDoctor,
  enableDoctor,
  toggleDoctorActive,
  CreateDoctorWithUserInput,
  CreateDoctorOnlyInput,
  UpdateDoctorInput,
  DoctorEntity,
} from '../api/api.doctors';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/* ================= Query Keys ================= */
export const doctorsKeys = {
  all: ['doctors'] as const,
  list: () => [...doctorsKeys.all] as const,
  detail: (id: string) => [...doctorsKeys.all, id] as const,
};

/* ================= Hook: Listado ================= */
export function useDoctors(options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) {
  return useQuery<DoctorEntity[], Error>({
    queryKey: doctorsKeys.list(),
    queryFn: fetchDoctors,
    staleTime: 1000 * 30, // 30s
    refetchOnWindowFocus: false,
    ...options,
  });
}

/* ================= Hook: Crear doctor + usuario ================= */
export function useCreateDoctorWithUser() {
  const qc = useQueryClient();
  return useMutation<DoctorEntity, Error, CreateDoctorWithUserInput>({
    mutationFn: (data) => createDoctorWithUser(data),
    onSuccess: (created) => {
      // Opción 1: Invalidar
      // qc.invalidateQueries({ queryKey: doctorsKeys.list() });

      // Opción 2: Insertar manualmente (optimista persistida)
      qc.setQueryData<DoctorEntity[] | undefined>(doctorsKeys.list(), (old) =>
        old ? [created, ...old] : [created],
      );
    },
  });
}

/* ================= Hook: Crear doctor (usuario ya existe) ================= */
export function useCreateDoctorOnly() {
  const qc = useQueryClient();
  return useMutation<DoctorEntity, Error, CreateDoctorOnlyInput>({
    mutationFn: (data) => createDoctorOnly(data),
    onSuccess: (created) => {
      qc.setQueryData<DoctorEntity[] | undefined>(doctorsKeys.list(), (old) =>
        old ? [created, ...old] : [created],
      );
    },
  });
}

/* ================= Hook: Actualizar doctor (solo campos doctor) ================= */
export function useUpdateDoctor() {
  const qc = useQueryClient();
  return useMutation<
    DoctorEntity,
    Error,
    { id: string; data: UpdateDoctorInput }
  >({
    mutationFn: ({ id, data }) => updateDoctor(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: doctorsKeys.list() });
      const prev = qc.getQueryData<DoctorEntity[]>(doctorsKeys.list());

      // Optimistic update
      if (prev) {
        qc.setQueryData<DoctorEntity[]>(doctorsKeys.list(), (old) =>
          old
            ? old.map((d) =>
                d.id === id
                  ? {
                      ...d,
                      specialty:
                        data.specialty !== undefined
                          ? data.specialty
                          : d.specialty,
                      license:
                        data.license !== undefined ? data.license : d.license,
                      bio: data.bio !== undefined ? data.bio : d.bio,
                    }
                  : d,
              )
            : old,
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(doctorsKeys.list(), ctx.prev);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: doctorsKeys.list() });
    },
  });
}

/* ================= Hook: Desactivar doctor ================= */
export function useDisableDoctor() {
  const qc = useQueryClient();
  return useMutation<DoctorEntity, Error, { id: string }>({
    mutationFn: ({ id }) => disableDoctor(id),
    onSuccess: (updated) => {
      qc.setQueryData<DoctorEntity[] | undefined>(doctorsKeys.list(), (old) =>
        old
          ? old.map((d) =>
              d.id === updated.id ? { ...d, user: updated.user } : d,
            )
          : old,
      );
    },
  });
}

/* ================= Hook: Activar doctor ================= */
export function useEnableDoctor() {
  const qc = useQueryClient();
  return useMutation<DoctorEntity, Error, { id: string }>({
    mutationFn: ({ id }) => enableDoctor(id),
    onSuccess: (updated) => {
      qc.setQueryData<DoctorEntity[] | undefined>(doctorsKeys.list(), (old) =>
        old
          ? old.map((d) =>
              d.id === updated.id ? { ...d, user: updated.user } : d,
            )
          : old,
      );
    },
  });
}

/* ================= Hook: Toggle (auto) ================= */
export function useToggleDoctorActive() {
  const qc = useQueryClient();
  return useMutation<DoctorEntity, Error, { doctor: DoctorEntity }>({
    mutationFn: ({ doctor }) => toggleDoctorActive(doctor),
    onMutate: async ({ doctor }) => {
      await qc.cancelQueries({ queryKey: doctorsKeys.list() });
      const prev = qc.getQueryData<DoctorEntity[]>(doctorsKeys.list());

      if (prev) {
        qc.setQueryData<DoctorEntity[]>(doctorsKeys.list(), (old) =>
          old
            ? old.map((d) =>
                d.id === doctor.id
                  ? {
                      ...d,
                      user: d.user
                        ? {
                            ...d.user,
                            status:
                              d.user.status?.toUpperCase() === 'ACTIVE'
                                ? 'INACTIVE'
                                : 'ACTIVE',
                          }
                        : d.user,
                    }
                  : d,
              )
            : old,
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(doctorsKeys.list(), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: doctorsKeys.list() });
    },
  });
}