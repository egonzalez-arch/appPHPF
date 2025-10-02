import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchClinics,
  createClinic,
  updateClinic,
  deleteClinic,
  ClinicEntity,
  CreateClinicInput,
  UpdateClinicInput,
} from '@/lib/api/api.clinics';

export const clinicsKeys = {
  list: (search?: string, companyId?: string) => ['clinics', search || '', companyId || ''] as const,
  detail: (id: string) => ['clinics', 'detail', id] as const,
};

export function useClinics(search?: string, companyId?: string) {
  return useQuery<ClinicEntity[], Error>({
    queryKey: clinicsKeys.list(search, companyId),
    queryFn: () => fetchClinics(search, companyId),
    staleTime: 30_000,
  });
}

export function useCreateClinic() {
  const qc = useQueryClient();
  return useMutation<ClinicEntity, Error, CreateClinicInput>({
    mutationFn: createClinic,
    onSuccess: (created) => {
      qc.setQueryData<ClinicEntity[] | undefined>(clinicsKeys.list(), (prev) => {
        if (!prev) return [created];
        if (prev.some(c => c.id === created.id)) return prev;
        return [created, ...prev];
      });
      queueMicrotask(() =>
        qc.invalidateQueries({ queryKey: clinicsKeys.list(), refetchType: 'active' }),
      );
    },
  });
}

export function useUpdateClinic() {
  const qc = useQueryClient();
  return useMutation<
    ClinicEntity,
    Error,
    { id: string; data: UpdateClinicInput }
  >({
    mutationFn: ({ id, data }) => updateClinic(id, data),
    onSuccess: (updated) => {
      qc.setQueryData<ClinicEntity[] | undefined>(clinicsKeys.list(), (prev) =>
        prev ? prev.map(c => (c.id === updated.id ? { ...c, ...updated } : c)) : [updated],
      );
      qc.invalidateQueries({ queryKey: clinicsKeys.list() });
    },
  });
}

export function useDeleteClinic() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string }>({
    mutationFn: ({ id }) => deleteClinic(id),
    onSuccess: (_, { id }) => {
      qc.setQueryData<ClinicEntity[] | undefined>(clinicsKeys.list(), (prev) =>
        prev ? prev.filter(c => c.id !== id) : prev,
      );
    },
  });
}