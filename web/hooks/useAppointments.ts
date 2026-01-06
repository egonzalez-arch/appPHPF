import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAppointments,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  AppointmentEntity,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentStatus,
} from '@/lib/api/api.appointments';

export const appointmentsKeys = {
  list: (filters?: string) => ['appointments', filters || ''] as const,
  detail: (id: string) => ['appointments', 'detail', id] as const,
};

interface ListFilters {
  doctorId?: string;
  patientId?: string;
  clinicId?: string;
  status?: AppointmentStatus;
}

function serializeFilters(f?: ListFilters) {
  if (!f) return '';
  return Object.entries(f)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}:${v}`)
    .join('|');
}

export function useAppointments(filters?: ListFilters) {
  const key = serializeFilters(filters);
  return useQuery<AppointmentEntity[], Error>({
    queryKey: appointmentsKeys.list(key),
    queryFn: () => fetchAppointments(filters),
    staleTime: 30_000,
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation<AppointmentEntity, Error, CreateAppointmentInput>({
    mutationFn: createAppointment,
    onSuccess: (created) => {
      qc.setQueryData<AppointmentEntity[] | undefined>(
        appointmentsKeys.list(),
        (prev) => {
          if (!prev) return [created];
          if (prev.some(a => a.id === created.id)) return prev;
          return [created, ...prev];
        }
      );
      queueMicrotask(() =>
        qc.invalidateQueries({ queryKey: appointmentsKeys.list() }),
      );
    },
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation<
    AppointmentEntity,
    Error,
    { id: string; data: UpdateAppointmentInput }
  >({
    mutationFn: ({ id, data }) => updateAppointment(id, data),
    onSuccess: (updated) => {
      qc.setQueryData<AppointmentEntity[] | undefined>(
        appointmentsKeys.list(),
        (prev) =>
          prev
            ? prev.map(a =>
                a.id === updated.id ? { ...a, ...updated } : a,
              )
            : [updated],
      );
      qc.invalidateQueries({ queryKey: appointmentsKeys.list() });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation<
    AppointmentEntity,
    Error,
    { id: string; status: AppointmentStatus }
  >({
    mutationFn: ({ id, status }) => updateAppointmentStatus(id, status),
    onSuccess: (updated) => {
      qc.setQueryData<AppointmentEntity[] | undefined>(
        appointmentsKeys.list(),
        (prev) =>
          prev
            ? prev.map(a =>
                a.id === updated.id ? { ...a, ...updated } : a,
              )
            : [updated],
      );
    },
  });
}

export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string }>({
    mutationFn: ({ id }) => deleteAppointment(id),
    onSuccess: (_ , { id }) => {
      qc.setQueryData<AppointmentEntity[] | undefined>(
        appointmentsKeys.list(),
        (prev) => (prev ? prev.filter(a => a.id !== id) : prev),
      );
    },
  });
}