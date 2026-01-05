'use client';

import dynamic from 'next/dynamic';
import { useMemo, useRef, useState, useEffect } from 'react';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import { AppointmentEntity, AppointmentStatus } from '@/lib/api/api.appointments';
import { AppointmentHistoryPanel } from './AppointmentHistoryPanel';
import { useUpdateAppointment } from '@/hooks/useAppointments';
import { useUpdateAppointmentStatus } from '@/hooks/useAppointments';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createAuditEvent } from '@/lib/api/api.audit';
import { useDoctorsLite } from '@/hooks/useDoctorsLite';

// NUEVO: para mapear si existe encounter por appointment
import { fetchEncounters, EncounterEntity } from '@/lib/api/api.encounters';

const FullCalendar = dynamic(() => import('@fullcalendar/react'), {
  ssr: false,
});

interface CalendarProps {
  appointments: AppointmentEntity[];
  onCreateFromRange: (start: Date, end: Date) => void;
  onEdit: (appt: AppointmentEntity) => void;
  onHardEditTimes?: (appt: AppointmentEntity, start: Date, end: Date) => void;
  onSoftFail?: (msg: string) => void;
}

export function AppointmentCalendar({
  appointments,
  onCreateFromRange,
  onEdit,
  onHardEditTimes,
  onSoftFail,
}: CalendarProps) {
  const { user: sessionUser } = useAuth();
  const { data: doctors } = useDoctorsLite(true); // load doctors
  const [selectedDetails, setSelectedDetails] = useState<AppointmentEntity | null>(null);
  const updateMut = useUpdateAppointment();
  const statusMut = useUpdateAppointmentStatus();
  const calendarRef = useRef<any>(null);
  const router = useRouter();

  // NUEVO: encounters por appointmentId
  const [encountersByAppt, setEncountersByAppt] = useState<Record<string, EncounterEntity>>({});

  useEffect(() => {
    let mounted = true;
    fetchEncounters()
      .then(list => {
        if (!mounted) return;
        const map: Record<string, EncounterEntity> = {};
        for (const e of list) {
          if (e.appointmentId) map[e.appointmentId] = e;
        }
        setEncountersByAppt(map);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const events = useMemo(
    () =>
      appointments.map((a) => ({
        id: a.id,
        title: a.reason
          ? a.reason.substring(0, 20)
          : `${a.clinicId?.slice?.(0, 4) ?? ''}-${String(a.doctorId ?? '').slice(0, 4)}`,
        start: a.startAt,
        end: a.endAt,
        backgroundColor: colorForStatus(a.status),
        borderColor: colorForStatus(a.status),
        extendedProps: {
          doctorId: a.doctorId,
          patientId: a.patientId,
          clinicId: a.clinicId,
          status: a.status,
          reason: a.reason,
        },
      })),
    [appointments],
  );

  function colorForStatus(s: AppointmentStatus) {
    switch (s) {
      case 'PENDING':
        return '#fbbf24';
      case 'CONFIRMED':
        return '#10b981';
      case 'CANCELLED':
        return '#ef4444';
      case 'COMPLETED':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  }

  function findAppointment(id: string) {
    return appointments.find((a) => a.id === id) || null;
  }

  function hasOverlap(doctorId: string, start: Date, end: Date, excludeId?: string) {
    return appointments.some((a) => {
      if (a.doctorId !== doctorId) return false;
      if (excludeId && a.id === excludeId) return false;
      const aStart = new Date(a.startAt).getTime();
      const aEnd = new Date(a.endAt).getTime();
      return aStart < end.getTime() && aEnd > start.getTime();
    });
  }

  function normalizeId(v: any): string | null {
    if (!v && v !== 0) return null;
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    if (typeof v === 'object') {
      return (v.id ?? v._id ?? v.userId ?? v.doctorId ?? v?.user?.id ?? null) || null;
    }
    return null;
  }
  function userIdCandidates(user: any): (string | null)[] {
    if (!user) return [];
    return [
      normalizeId(user.id),
      normalizeId(user.sub),
      normalizeId(user.userId),
      normalizeId(user.doctorId),
      normalizeId(user.profile?.id),
      normalizeId(user.profile?.doctorId),
    ].filter(Boolean) as string[];
  }
  function appointmentDoctorId(appt: AppointmentEntity) {
    return (
      normalizeId((appt as any).doctorId) ||
      normalizeId((appt as any).doctor?.id) ||
      normalizeId((appt as any).doctor?.user?.id) ||
      null
    );
  }

  // NUEVO: intenta resolver doctor.id desde la tabla de doctores a partir del sessionUser
  function doctorIdForSessionUser(): string | null {
    if (!sessionUser || !doctors) return null;
    // buscar doctor cuyo user.id coincida con sessionUser.id o email
    const sid = normalizeId(sessionUser.id) || normalizeId(sessionUser.sub) || null;
    const semail = (sessionUser as any)?.email?.toLowerCase?.() ?? null;
    const found = doctors.find((d: any) => {
      const duid = normalizeId(d.user?.id) || normalizeId(d.user?.userId) || null;
      const demail = (d.user?.email ?? d.email ?? '')?.toLowerCase?.() ?? null;
      if (sid && duid && sid === duid) return true;
      if (semail && demail && semail === demail) return true;
      return false;
    });
    return found?.id ?? null;
  }

  function isUserAssignedDoctorForAppointment(appt: AppointmentEntity) {
    if (!appt || !sessionUser) return false;

    // 1) Try mapping sessionUser -> doctor record
    const docIdFromUser = doctorIdForSessionUser();
    if (docIdFromUser && appt.doctorId && String(appt.doctorId) === String(docIdFromUser)) {
      return true;
    }

    // 2) fallback: previous candidate matches (if sessionUser contains doctorId directly)
    const candidates = userIdCandidates(sessionUser);
    const apptDocId = appointmentDoctorId(appt);
    if (apptDocId && candidates.some((c) => c === apptDocId)) return true;

    return false;
  }

  // NUEVO: abrir manage encounter (iniciar) o ver detalle si ya existe
  function openEncounterManage(appt: AppointmentEntity) {
    const enc = encountersByAppt[appt.id];
    const userId = (sessionUser as any)?.id ?? (sessionUser as any)?.sub ?? undefined;

    if (enc) {
      if (userId) {
        // Fire-and-forget audit (include userId)
        void createAuditEvent({
          action: 'encounter.open_from_calendar',
          entity: 'encounter',
          entityId: enc.id,
          metadata: { appointmentId: appt.id, from: 'calendar' },
          userId,
          actorUserId: userId,
          description: `Open encounter ${enc.id} from calendar`,
        });
      }
      router.push(`/dashboard/encounters/${enc.id}`);
      return;
    }

    // check authorization
    if (!isUserAssignedDoctorForAppointment(appt)) {
      onSoftFail?.('Solo el doctor asignado a la cita puede iniciar el encuentro.');

      if (userId) {
        void createAuditEvent({
          action: 'encounter.start_denied',
          entity: 'appointment',
          entityId: appt.id,
          metadata: { reason: 'not_assigned_doctor', from: 'calendar' },
          userId,
          actorUserId: userId,
          description: `Start encounter denied for appointment ${appt.id}`,
        });
      }
      return;
    }

    // Authorized: record click but do not await audit call (fire-and-forget)
    if (userId) {
      void createAuditEvent({
        action: 'encounter.start_click',
        entity: 'appointment',
        entityId: appt.id,
        metadata: { from: 'calendar' },
        userId,
        actorUserId: userId,
        description: `Start encounter clicked for appointment ${appt.id}`,
      });
    }

    router.push(`/dashboard/encounters/manage?appointmentId=${appt.id}`);
  }

  return (
    <div className="relative">
      <FullCalendar
        ref={calendarRef}
        plugins={[interactionPlugin, timeGridPlugin, dayGridPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        selectable
        editable
        eventResizableFromStart
        events={events}
        allDaySlot={false}
        slotMinTime="07:00:00"
        slotMaxTime="21:00:00"
        selectMirror
        select={(info) => {
          onCreateFromRange(info.start, info.end);
        }}
        eventClick={(info) => {
          const appt = findAppointment(info.event.id);
          if (appt) setSelectedDetails(appt);
        }}
        eventDrop={(info) => {
          const appt = findAppointment(info.event.id);
          if (!appt) return;
          const newStart = new Date(info.event.start!);
          const newEnd = new Date(info.event.end!);
          if (hasOverlap(appt.doctorId, newStart, newEnd, appt.id)) {
            info.revert();
            onSoftFail?.('Solapamiento detectado (cliente), se revierte.');
            return;
          }
          updateMut.mutate(
            {
              id: appt.id,
              data: { startAt: newStart.toISOString(), endAt: newEnd.toISOString() },
            },
            {
              onError: () => {
                info.revert();
                onSoftFail?.('Error al actualizar en servidor, revertido.');
              },
            },
          );
        }}
        eventResize={(info) => {
          const appt = findAppointment(info.event.id);
          if (!appt) return;
          const newStart = new Date(info.event.start!);
          const newEnd = new Date(info.event.end!);
          if (hasOverlap(appt.doctorId, newStart, newEnd, appt.id)) {
            info.revert();
            onSoftFail?.('Solapamiento detectado (cliente), se revierte.');
            return;
          }
          updateMut.mutate(
            {
              id: appt.id,
              data: { startAt: newStart.toISOString(), endAt: newEnd.toISOString() },
            },
            {
              onError: () => {
                info.revert();
                onSoftFail?.('Error al actualizar en servidor, revertido.');
              },
            },
          );
        }}
        height="auto"
      />

      {selectedDetails && (
        <AppointmentHistoryPanel
          appointment={selectedDetails}
          onClose={() => setSelectedDetails(null)}
          onEdit={(a) => {
            setSelectedDetails(null);
            onEdit(a);
          }}
          loadingStatus={statusMut.isPending}
          onChangeStatus={(a, status) => {
            statusMut.mutate(
              { id: a.id, status },
              {
                onSuccess: (updated) => {
                  // Keep panel open, update local selection with new status
                  setSelectedDetails({ ...a, status: updated.status });
                },
              },
            );
          }}
          // NUEVO: CTA para encuentro desde el panel -> abrir manage o ver detalle
          onOpenEncounter={(a) => openEncounterManage(a)}
          encounterCtaLabel={
            // Si existe encuentro, mostrar 'Ver detalle' en lugar de 'Actualizar encuentro'
            encountersByAppt[selectedDetails.id] ? 'Ver detalle' : 'Iniciar encuentro'
          }
        />
      )}
    </div>
  );
}