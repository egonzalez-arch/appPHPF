'use client';

import { useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { fetchPatients, Patient } from '@/lib/api/api';
import { fetchAppointments, AppointmentEntity } from '@/lib/api/api.appointments';
import { fetchEncounters, EncounterEntity } from '@/lib/api/api.encounters';
import { fetchVitals, VitalsEntity } from '@/lib/api/api.vitals';

// Activa logs de diagnóstico en consola si necesitas inspeccionar la forma real de los datos
const DEBUG_LOG = false;

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

function getEncounterAppointmentId(e: any): string | undefined {
  return (
    e?.appointmentId ||
    e?.appointment_id ||
    e?.appointment?.id ||
    (typeof e?.appointmentId === 'string' ? e.appointmentId : undefined)
  );
}
function getEncounterPatientId(e: any): string | undefined {
  return (
    e?.patientId ||
    e?.patient_id ||
    e?.patient?.id ||
    (typeof e?.patientId === 'string' ? e.patientId : undefined)
  );
}

export function usePatientRecord(patientId?: string) {
  // 1) Paciente
  const qPatients = useQuery({
    queryKey: ['patient', patientId],
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000, // 10 min - catálogo relativamente estable
    queryFn: async () => {
      const list = await fetchPatients();
      const found = list.find((p) => p.id === patientId) || null;
      if (DEBUG_LOG) console.log('[Record] patient', { patientId, found });
      return found;
    },
  });

  // 2) Citas (con filtro patientId si el backend lo soporta)
  const qAppointments = useQuery({
    queryKey: ['appointments', 'patient', patientId],
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 min
    queryFn: async () => {
      // Intenta filtrar por patientId; si el backend no soporta, devuelve todo
      try {
        const filtered = await fetchAppointments({ patientId });
        if (DEBUG_LOG) console.log('[Record] appointments (filtered)', filtered?.length);
        return filtered;
      } catch {
        // Fallback: trae todo y filtra en cliente
        const all = await fetchAppointments();
        if (DEBUG_LOG) console.log('[Record] appointments (all, fallback)', all?.length);
        return all;
      }
    },
  });

  // 3) Encuentros (con filtro patientId si el backend lo soporta)
  const qEncounters = useQuery({
    queryKey: ['encounters', 'patient', patientId],
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 min
    queryFn: async () => {
      try {
        const filtered = await fetchEncounters({ patientId });
        if (DEBUG_LOG) {
          console.log('[Record] encounters (filtered)', filtered?.length);
          if (filtered?.length) console.log('[Record] example encounter', filtered[0]);
        }
        return filtered;
      } catch {
        // Fallback: trae todo
        const all = await fetchEncounters();
        if (DEBUG_LOG) {
          console.log('[Record] encounters (all, fallback)', all?.length);
          if (all?.length) console.log('[Record] example encounter', all[0]);
        }
        return all;
      }
    },
  });

  // 4) Derivados
  const patientAppointments: AppointmentEntity[] = useMemo(() => {
    if (!patientId || !qAppointments.data) return [];
    const list = qAppointments.data.filter((a: any) => {
      // algunos APIs devuelven a.patientId o a.patient?.id
      const pid = a?.patientId || a?.patient?.id || a?.patient_id;
      return pid === patientId;
    });
    if (DEBUG_LOG) console.log('[Record] patientAppointments', list.length);
    return list;
  }, [qAppointments.data, patientId]);

  const apptById = useMemo(() => {
    const map = new Map<string, AppointmentEntity>();
    for (const a of patientAppointments) {
      map.set((a as any).id, a);
    }
    return map;
  }, [patientAppointments]);

  const patientEncounters: EncounterEntity[] = useMemo(() => {
    if (!qEncounters.data) return [];
    const out: EncounterEntity[] = [];
    for (const e of qEncounters.data as any[]) {
      const encPid = getEncounterPatientId(e);
      if (encPid && encPid === patientId) {
        out.push(e);
        continue;
      }
      const encApptId = getEncounterAppointmentId(e);
      if (encApptId && apptById.has(encApptId)) {
        out.push(e);
      }
    }
    if (DEBUG_LOG) {
      console.log('[Record] patientEncounters', out.length);
      if (!out.length && (qEncounters.data as any[])?.length) {
        const sample = (qEncounters.data as any[])[0];
        console.log('[Record] sample encounter fields', Object.keys(sample || {}));
        console.log('[Record] derived encApptId', getEncounterAppointmentId(sample));
        console.log('[Record] derived encPatientId', getEncounterPatientId(sample));
      }
    }
    return out;
  }, [qEncounters.data, apptById, patientId]);

  // 5) Vitals por cada encounter del paciente
  const vitalsQueries = useQueries({
    queries: (patientEncounters || []).map((enc: any) => ({
      queryKey: ['vitals', 'by-encounter', enc.id],
      enabled: !!enc?.id && !!patientId,
      queryFn: async () => {
        try {
          const v = await fetchVitals({ encounterId: enc.id });
          return v as VitalsEntity[];
        } catch {
          return [] as VitalsEntity[];
        }
      },
    })),
  });

  const vitals: VitalsEntity[] = useMemo(
    () => vitalsQueries.flatMap((q) => (q.data as VitalsEntity[] | undefined) || []),
    [vitalsQueries],
  );

  // 6) Summary
  const lastVitals =
    vitals
      .slice()
      .sort(
        (a, b) =>
          new Date(b.recordedAt || '').getTime() - new Date(a.recordedAt || '').getTime(),
      )[0] || null;

  const nextAppointment =
    patientAppointments
      .filter((a) => new Date(a.startAt).getTime() > Date.now())
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0] || null;

  const result: RecordData = useMemo(
    () => ({
      patient: qPatients.data || null,
      appointments: patientAppointments,
      encounters: patientEncounters,
      vitals,
      summary: {
        lastVitals,
        nextAppointment,
        encountersCount: patientEncounters.length,
      },
    }),
    [qPatients.data, patientAppointments, patientEncounters, vitals, lastVitals, nextAppointment],
  );

  const isLoading =
    qPatients.isLoading ||
    qAppointments.isLoading ||
    qEncounters.isLoading ||
    vitalsQueries.some((q) => q.isLoading);

  const isError =
    qPatients.isError ||
    qAppointments.isError ||
    qEncounters.isError ||
    vitalsQueries.some((q) => q.isError);

  const error =
    qPatients.error ||
    qAppointments.error ||
    qEncounters.error ||
    vitalsQueries.find((q) => q.error)?.error;

  return { data: result, isLoading, isError, error };
}