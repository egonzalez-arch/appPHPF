import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  CompanyEntity,
  CreateCompanyInput,
  UpdateCompanyInput,
} from '@/lib/api/api.companies';

export const companiesKeys = {
  list: (search?: string) => ['companies', search] as const,
  detail: (id: string) => ['companies', 'detail', id] as const,
};

export function useCompanies(search?: string) {
  return useQuery<CompanyEntity[], Error>({
    queryKey: companiesKeys.list(search),
    queryFn: () => fetchCompanies(search),
    staleTime: 30_000,
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation<CompanyEntity, Error, CreateCompanyInput>({
    mutationFn: createCompany,
    onSuccess: (created) => {
      qc.setQueryData<CompanyEntity[] | undefined>(companiesKeys.list(), (prev) => {
        if (!prev) return [created];
        if (prev.some(c => c.id === created.id)) return prev;
        return [created, ...prev];
      });
      queueMicrotask(() =>
        qc.invalidateQueries({ queryKey: companiesKeys.list(), refetchType: 'active' }),
      );
    },
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation<
    CompanyEntity,
    Error,
    { id: string; data: UpdateCompanyInput }
  >({
    mutationFn: ({ id, data }) => updateCompany(id, data),
    onSuccess: (updated) => {
      qc.setQueryData<CompanyEntity[] | undefined>(companiesKeys.list(), (prev) =>
        prev ? prev.map(c => (c.id === updated.id ? { ...c, ...updated } : c)) : [updated],
      );
      qc.invalidateQueries({ queryKey: companiesKeys.list() });
    },
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string }>({
    mutationFn: ({ id }) => deleteCompany(id),
    onSuccess: (_, { id }) => {
      qc.setQueryData<CompanyEntity[] | undefined>(companiesKeys.list(), (prev) =>
        prev ? prev.filter(c => c.id !== id) : prev,
      );
    },
  });
}