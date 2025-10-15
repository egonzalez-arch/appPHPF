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
          : `${a.clinicId.slice(0, 4)}-${a.doctorId.slice(0, 4)}`,
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

  // NUEVO: abrir manage encounter (iniciar/actualizar)
  function openEncounterManage(appt: AppointmentEntity) {
    const enc = encountersByAppt[appt.id];
    if (enc) {
      router.push(`/dashboard/encounters/manage?encounterId=${enc.id}`);
    } else {
      router.push(`/dashboard/encounters/manage?appointmentId=${appt.id}`);
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
                  // Keep panel open, update local selection with new status
                  setSelectedDetails({ ...a, status: updated.status });
                },
              },
            );
          }}
          // NUEVO: CTA para encuentro desde el panel
          onOpenEncounter={(a) => openEncounterManage(a)}
          encounterCtaLabel={
            encountersByAppt[selectedDetails.id] ? 'Actualizar encuentro' : 'Iniciar encuentro'
          }
        />
      )}
    </div>
  );
}