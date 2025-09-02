'use client';
import { QueryClientProvider } from '@tanstack/react-query';
import { client } from '@/lib/api/api';
import PatientsPageContent from './PatientsPageContent';

export default function PatientsPage() {
  return (
    <QueryClientProvider client={client}>
      <PatientsPageContent />
    </QueryClientProvider>
  );
}