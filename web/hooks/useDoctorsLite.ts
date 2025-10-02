import { useQuery } from '@tanstack/react-query';
import { API_URL } from '@/lib/api/api';

interface DoctorLite {
  id: string;
  specialty?: string;
  user?: { firstName?: string; lastName?: string; email?: string };
}

function getCsrf() {
  if (typeof document === 'undefined') return '';
  return (
    document.cookie
      .split('; ')
      .find(r => r.startsWith('csrf_token='))?.split('=')[1] || ''
  );
}

async function fetchDoctorsLite(): Promise<DoctorLite[]> {
  const res = await fetch(`${API_URL}/doctors`, {
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrf() },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function useDoctorsLite(enabled = true) {
  return useQuery<DoctorLite[], Error>({
    queryKey: ['doctors', 'lite'],
    queryFn: fetchDoctorsLite,
    enabled,
    staleTime: 60_000,
  });
}