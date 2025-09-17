import { useQuery } from '@tanstack/react-query';
import { fetchPatients } from '../lib/api/api';

export function usePatients(token?: string) {
  return useQuery({
    queryKey: ['patients'],
    queryFn: () => fetchPatients(token!),
    enabled: !!token, // evita llamar sin token
  });
}