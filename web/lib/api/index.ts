import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';

export const client = new QueryClient();

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const res = await fetch('/api/patients', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    }
  });
}

export function useCreatePatient() {
  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/patients', {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    }
  });
}