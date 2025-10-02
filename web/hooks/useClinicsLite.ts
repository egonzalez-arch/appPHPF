import { useQuery } from '@tanstack/react-query';
import { API_URL } from '@/lib/api/api';

interface ClinicLite {
  id: string;
  name: string;
}

function getCsrf() {
  if (typeof document === 'undefined') return '';
  return (
    document.cookie
      .split('; ')
      .find(r => r.startsWith('csrf_token='))?.split('=')[1] || ''
  );
}

async function fetchClinicsLite(): Promise<ClinicLite[]> {
  const res = await fetch(`${API_URL}/clinics`, {
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrf() },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function useClinicsLite(enabled = true) {
  return useQuery<ClinicLite[], Error>({
    queryKey: ['clinics', 'lite'],
    queryFn: fetchClinicsLite,
    enabled,
    staleTime: 60_000,
  });
}