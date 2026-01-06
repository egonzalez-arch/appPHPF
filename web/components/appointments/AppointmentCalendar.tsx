'use client';

import dynamic from 'next/dynamic';
import { useMemo, useRef, useState, useEffect } from 'react';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import { AppointmentEntity, AppointmentStatus } from '@/lib/api/api.appointments';
import { AppointmentHistoryPanel } from './AppointmentHistoryPanel';
import { useUpdateAppointment, useUpdateAppointmentStatus } from '@/hooks/useAppointments';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createAuditEvent } from '@/lib/api/api.audit';
import { useDoctorsLite } from '@/hooks/useDoctorsLite';
import { isUserAssignedDoctorForAppointment } from '@/lib/auth/doctorAuth';
import { fetchEncounters, createEncounter, EncounterEntity } from '@/lib/api/api.encounters';

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
  const { data: doctorsLite } = useDoctorsLite(true);
  const [selectedDetails, setSelectedDetails] = useState<AppointmentEntity | null>(null);
  const updateMut = useUpdateAppointment();
  const statusMut = useUpdateAppointmentStatus();
  const calendarRef = useRef<any>(null);
  const router = useRouter();

  // encounters por appointmentId
  const [encountersByAppt, setEncountersByAppt] = useState<Record<string, EncounterEntity>>({});

  useEffect(() => {
    let mounted = true;
    fetchEncounters()
      .then((list) => {
        if (!mounted) return;
        const map: Record<string, EncounterEntity> = {};
        for (const e of list) {
          if (e.appointmentId) map[e.appointmentId] = e;
        }
        setEncountersByAppt(map);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const events = useMemo(
    () =>
      appointments.map((a) => ({
        id: a.id,
        title: a.reason
          ? a.reason.substring(0, 20)
          : `${a.clinicId?.slice?.(0, 4) ?? ''}-${String(a.doctorId ?? '').slice(
              0,
              4,
            )}`,
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

  // Iniciar / ver encuentro desde el panel (botón azul "Iniciar encuentro")
  async function openEncounterManage(appt: AppointmentEntity) {
    const userId = (sessionUser as any)?.id ?? (sessionUser as any)?.sub;

    // Si ya existe encounter para esta cita, ir a manage con encounterId
    const existing = encountersByAppt[appt.id];
    if (existing) {
      if (userId) {
        void createAuditEvent({
          action: 'encounter.open_from_calendar',
          entity: 'encounter',
          entityId: existing.id,
          metadata: { appointmentId: appt.id, from: 'calendar' },
          userId,
          actorUserId: userId,
          description: `Open encounter ${existing.id} from calendar`,
        });
      }
      router.push(`/dashboard/encounters/manage?encounterId=${existing.id}`);
      return;
    }

    // Autorización: solo el doctor asignado a la cita
    const canStart = isUserAssignedDoctorForAppointment(appt, doctorsLite, sessionUser);
    if (!canStart) {
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

    try {
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

      // 1) Crear encounter igual que lo harías en ManageEncounterPage
      const created = await createEncounter({
        appointmentId: appt.id,
        encounterDate: new Date().toISOString(),
        reason: appt.reason || '',
        diagnosis: '',
        notes: '',
        status: 'IN_PROGRESS',
      });

      setEncountersByAppt((prev) => ({ ...prev, [appt.id]: created }));

      // 2) Cambiar estado de cita a IN_PROGRESS (si aplica)
      if (
        appt.status !== 'COMPLETED' &&
        appt.status !== 'CANCELLED' &&
        appt.status !== 'IN_PROGRESS'
      ) {
        statusMut.mutate(
          { id: appt.id, status: 'IN_PROGRESS' },
          {
            onSuccess: (updatedAppt) => {
              setSelectedDetails((prev) =>
                prev && prev.id === updatedAppt.id
                  ? { ...prev, status: updatedAppt.status }
                  : prev,
              );
            },
          },
        );
      }

      // 3) Audit de creación desde calendario
      if (userId) {
        void createAuditEvent({
          action: 'encounter.create_from_calendar',
          entity: 'encounter',
          entityId: created.id,
          metadata: {
            appointmentId: created.appointmentId,
            status: created.status,
            from: 'calendar',
          },
          userId,
          actorUserId: userId,
          description: `Encounter ${created.id} created from calendar`,
        });
      }

      // 4) Navegar a la página de manage con encounterId
      router.push(`/dashboard/encounters/manage?encounterId=${created.id}`);
    } catch (e: any) {
      onSoftFail?.(e?.message || 'Error al iniciar encuentro.');
    }
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
                  setSelectedDetails({ ...a, status: updated.status });
                },
              },
            );
          }}
          onOpenEncounter={(a) => openEncounterManage(a)}
          encounterCtaLabel={
            encountersByAppt[selectedDetails.id] ? 'Ver detalle' : 'Iniciar encuentro'
          }
        />
      )}
    </div>
  );
}