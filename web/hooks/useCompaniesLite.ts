import { useQuery } from '@tanstack/react-query';
import { API_URL } from '@/lib/api/api';

interface CompanyLite {
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

async function fetchCompaniesLite(): Promise<CompanyLite[]> {
  const res = await fetch(`${API_URL}/companies`, {
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrf() },
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return Array.isArray(data)
    ? data.map((c: any) => ({ id: c.id, name: c.name }))
    : [];
}

export function useCompaniesLite(enabled = true) {
  return useQuery<CompanyLite[], Error>({
    queryKey: ['companies', 'lite'],
    queryFn: fetchCompaniesLite,
    enabled,
    staleTime: 60_000,
  });
}