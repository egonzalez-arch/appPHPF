import { Injectable, Logger } from '@nestjs/common';

interface AppointmentNotificationPayload {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  clinicId: string;
  startAt: Date;
  endAt: Date;
  status?: string;
  reason?: string;
  action: 'created' | 'status-changed' | 'cancelled';
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger('NotificationsService');

  async emitAppointmentEvent(payload: AppointmentNotificationPayload) {
    // Aquí podrías publicar a Redis, Kafka, WebSocket, etc.
    this.logger.log(
      `Appointment event: ${payload.action} | appt=${payload.appointmentId} doctor=${payload.doctorId} patient=${payload.patientId}`,
    );
  }

  async sendEmail(to: string, subject: string, body: string) {
    // Stub: reemplazar por proveedor real
    this.logger.log(`(EMAIL STUB) To=${to} Subject="${subject}" Body="${body}"`);
  }

  async notifyAppointmentCreated(data: AppointmentNotificationPayload & { patientEmail?: string; doctorEmail?: string; }) {
    await this.emitAppointmentEvent(data);
    if (data.patientEmail) {
      await this.sendEmail(
        data.patientEmail,
        'Cita creada',
        `Tu cita ha sido creada para ${data.startAt.toISOString()}`,
      );
    }
  }

  async notifyStatusChanged(data: AppointmentNotificationPayload & { patientEmail?: string; doctorEmail?: string; }) {
    await this.emitAppointmentEvent(data);
    if (data.patientEmail) {
      await this.sendEmail(
        data.patientEmail,
        'Estado de cita actualizado',
        `Nuevo estado: ${data.status}`,
      );
    }
  }

  async notifyCancelled(data: AppointmentNotificationPayload & { patientEmail?: string }) {
    await this.emitAppointmentEvent(data);
    if (data.patientEmail) {
      await this.sendEmail(
        data.patientEmail,
        'Cita cancelada',
        `Tu cita del ${data.startAt.toISOString()} ha sido cancelada.`,
      );
    }
  }
}