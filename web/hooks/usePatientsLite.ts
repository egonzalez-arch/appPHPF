import { useQuery } from '@tanstack/react-query';
import { API_URL } from '@/lib/api/api';

function getCsrf() {
  if (typeof document === 'undefined') return '';
  return (
    document.cookie
      .split('; ')
      .find(r => r.startsWith('csrf_token='))?.split('=')[1] || ''
  );
}

interface PatientLite {
  id: string;
  user?: { firstName?: string; lastName?: string; email?: string };
}

async function fetchPatientsLite(): Promise<PatientLite[]> {
  const res = await fetch(`${API_URL}/patients`, {
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrf() },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function usePatientsLite(enabled = true) {
  return useQuery<PatientLite[], Error>({
    queryKey: ['patients', 'lite'],
    queryFn: fetchPatientsLite,
    enabled,
    staleTime: 60_000,
  });
}