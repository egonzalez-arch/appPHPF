import { useQuery } from '@tanstack/react-query';
import { fetchPatients } from '../lib/api/api';

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: () => fetchPatients(),
    enabled: true, // uses cookies for auth
  });
}