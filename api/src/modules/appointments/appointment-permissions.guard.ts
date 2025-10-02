import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppointmentService } from './appointment.service';
import { AppointmentStatus } from './appointment-status-enum';

@Injectable()
export class AppointmentPermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private appointments: AppointmentService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;
    const url = request.url;

    if (!user) throw new ForbiddenException('User not authenticated');

    // ADMIN full access
    if (user.role === 'ADMIN') return true;

    // Creation: patient can create only if body.patientId belongs to them
    if (method === 'POST' && url.endsWith('/appointments')) {
      if (user.role === 'PATIENT') {
        if (request.body.patientIdUserMap && request.body.patientIdUserMap !== user.id) {
          throw new ForbiddenException('No puedes crear cita para otro paciente');
        }
        // o si tu entidad patient asocia userId => hay que resolverlo antes
      }
      return true;
    }

    // For operations on existing appointment
    const id = request.params.id;
    if (!id) return true; // e.g. listing

    const appt = await this.appointments.findOne(id);

    // DOCTOR rules
    if (user.role === 'DOCTOR') {
      if (method === 'DELETE') {
        // Ej: permitir borrar solo si es su cita y está PENDING
        if (appt.doctorId !== user.doctorId) {
          throw new ForbiddenException('No puedes eliminar citas de otros doctores');
        }
        if (appt.status !== AppointmentStatus.PENDING) {
          throw new ForbiddenException('Solo puedes eliminar citas pendientes');
        }
        return true;
      }

      if (method === 'PATCH' && url.includes('/status')) {
        if (appt.doctorId !== user.doctorId) {
          throw new ForbiddenException('No puedes cambiar estado de otra cita');
        }
        const newStatus = request.body.status as AppointmentStatus;
        // DOCTOR allowed transitions:
        const allowed: AppointmentStatus[] = [
          AppointmentStatus.CONFIRMED,
          AppointmentStatus.COMPLETED,
          AppointmentStatus.CANCELLED,
        ];
        if (!allowed.includes(newStatus)) {
          throw new ForbiddenException('Transición de estado no permitida');
        }
        return true;
      }

      if (method === 'PATCH') {
        if (appt.doctorId !== user.doctorId) {
          throw new ForbiddenException('No puedes actualizar otra cita');
        }
        return true;
      }

      if (method === 'GET') {
        // Permitir ver (o filtrar en service)
        return true;
      }
    }

    // PATIENT rules
    if (user.role === 'PATIENT') {
      // Asumimos que appt.patientId se puede mapear al user mediante patient->userId en tu modelo,
      // Si no, tienes que haber guardado userId directamente.
      // Aquí simplificamos y asumimos patientId es "propiedad" del user en sesión vía relación.
      if (method === 'DELETE') {
        throw new ForbiddenException('El paciente no puede eliminar citas (usar cancelación).');
      }
      if (method === 'PATCH' && url.includes('/status')) {
        // Paciente solo puede cancelar su cita
        if (appt.patientId !== user.patientId) {
          throw new ForbiddenException('No puedes cambiar estado de otra cita');
        }
        const newStatus = request.body.status as AppointmentStatus;
        if (newStatus !== AppointmentStatus.CANCELLED) {
          throw new ForbiddenException('Solo puedes cancelar tu cita');
        }
        return true;
      }
      if (method === 'PATCH') {
        // Reprogramar? Depende de la política. Bloqueamos por defecto.
        throw new ForbiddenException('El paciente no puede reprogramar directamente.');
      }
      if (method === 'GET') {
        // Permitir ver (puede filtrar en capa service)
        return true;
      }
    }

    return true;
  }
}