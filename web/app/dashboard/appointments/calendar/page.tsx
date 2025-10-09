'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useAppointments } from '@/hooks/useAppointments';
import { useDoctorsLite } from '@/hooks/useDoctorsLite';
import { usePatientsLite } from '@/hooks/usePatientsLite';
import { useClinicsLite } from '@/hooks/useClinicsLite';
import { AppointmentStatus } from '@/lib/api/api.appointments';

const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false });
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function AppointmentsCalendarPage() {
  const { data: appts } = useAppointments();
  const { data: doctors } = useDoctorsLite(true);
  const { data: patients } = usePatientsLite(true);
  const { data: clinics } = useClinicsLite(true);

  const events = useMemo(
    () =>
      (appts || []).map(a => {
        const doctor = doctors?.find(d => d.id === a.doctorId);
        const patient = patients?.find(p => p.id === a.patientId);
        const clinic = clinics?.find(c => c.id === a.clinicId);
        const title = `${clinic?.name || 'Clínica'} | ${doctor?.user?.firstName || ''} ${patient?.user?.firstName || ''}`;
        return {
          id: a.id,
          title: title.trim(),
          start: a.startAt,
          end: a.endAt,
          backgroundColor: colorForStatus(a.status),
          borderColor: colorForStatus(a.status),
        };
      }),
    [appts, doctors, patients, clinics],
  );

  function colorForStatus(s: AppointmentStatus) {
    switch (s) {
      case 'PENDING': return '#fbbf24';
      case 'CONFIRMED': return '#10b981';
      case 'CANCELLED': return '#ef4444';
      case 'COMPLETED': return '#3b82f6';
      default: return '#6b7280';
    }
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Calendario de Citas</h1>
      <div className="bg-white rounded shadow p-2">
        <FullCalendar
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          allDaySlot={false}
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          height="auto"
          eventClick={(info) => {
            alert(`Cita ID: ${info.event.id}\n${info.event.title}`);
          }}
        />
      </div>
    </div>
  );
}