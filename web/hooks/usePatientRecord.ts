'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPatients, Patient } from '@/lib/api/api';
import { fetchAppointments, AppointmentEntity } from '@/lib/api/api.appointments';
import { fetchEncounters, EncounterEntity } from '@/lib/api/api.encounters';
import { fetchVitals, VitalsEntity } from '@/lib/api/api.vitals';

type RecordData = {
  patient?: Patient | null;
  appointments: AppointmentEntity[];
  encounters: EncounterEntity[];
  vitals: VitalsEntity[];
  summary: {
    lastVitals?: VitalsEntity | null;
    nextAppointment?: AppointmentEntity | null;
    encountersCount: number;
  };
};

export function usePatientRecord(patientId?: string) {
  const qPatients = useQuery({
    queryKey: ['patient', patientId],
    enabled: !!patientId,
    queryFn: async () => {
      const list = await fetchPatients(); // MVP: filtra client-side
      return list.find(p => p.id === patientId) || null;
    },
  });

  const qAppointments = useQuery({
    queryKey: ['appointments', 'by-patient', patientId],
    enabled: !!patientId,
    queryFn: async () => {
      // Si el backend aún no filtra, trae todo y filtra
      const all = await fetchAppointments();
      return all.filter(a => a.patientId === patientId);
    },
  });

  const qEncounters = useQuery({
    queryKey: ['encounters', 'by-patient', patientId],
    enabled: !!patientId,
    queryFn: async () => {
      const all = await fetchEncounters();
      return all.filter(e => e.patientId === patientId);
    },
  });

  const qVitals = useQuery({
    queryKey: ['vitals', 'by-patient', patientId],
    enabled: !!patientId,
    queryFn: async () => {
      const all = await fetchVitals({});
      return all.filter(v => (v as any).patientId === patientId || (v as any).encounterPatientId === patientId);
    },
  });

  const lastVitals =
    (qVitals.data || [])
      .slice()
      .sort((a, b) => new Date(b.recordedAt || '').getTime() - new Date(a.recordedAt || '').getTime())[0] || null;

  const nextAppointment =
    (qAppointments.data || [])
      .filter(a => new Date(a.startAt).getTime() > Date.now())
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0] || null;

  const result: RecordData = {
    patient: qPatients.data || null,
    appointments: qAppointments.data || [],
    encounters: qEncounters.data || [],
    vitals: qVitals.data || [],
    summary: {
      lastVitals,
      nextAppointment,
      encountersCount: (qEncounters.data || []).length,
    },
  };

  const isLoading =
    qPatients.isLoading || qAppointments.isLoading || qEncounters.isLoading || qVitals.isLoading;

  const isError =
    qPatients.isError || qAppointments.isError || qEncounters.isError || qVitals.isError;

  const error =
    qPatients.error || qAppointments.error || qEncounters.error || qVitals.error;

  return { data: result, isLoading, isError, error };
}