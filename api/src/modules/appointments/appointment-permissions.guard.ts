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

    // Creation
    if (method === 'POST' && url.endsWith('/appointments')) {
      if (user.role === 'PATIENT') {
        // Si necesitas mapear patientId -> userId hazlo aquí
        // Este ejemplo asume que 'request.body.patientIdUserMap' vendría si haces un pre-mapeo (opcional)
      }
      return true;
    }

    // If not referencing an existing resource (listing/filtros)
    const id = request.params.id;
    if (!id) return true;

    const appt = await this.appointments.findOne(id);

    // DOCTOR
    if (user.role === 'DOCTOR') {
      if (method === 'DELETE') {
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
      if (method === 'GET') return true;
    }

    // PATIENT
    if (user.role === 'PATIENT') {
      if (method === 'DELETE') {
        throw new ForbiddenException('El paciente no puede eliminar citas (use cancelación).');
      }
      if (method === 'PATCH' && url.includes('/status')) {
        // Implementa lógica para mapear appt.patientId -> user.patientId
        // Si no se guarda userId, necesitas join paciente->userId
        const newStatus = request.body.status as AppointmentStatus;
        if (newStatus !== AppointmentStatus.CANCELLED) {
          throw new ForbiddenException('Solo puedes cancelar tu cita');
        }
        return true;
      }
      if (method === 'PATCH') {
        throw new ForbiddenException('El paciente no puede reprogramar directamente.');
      }
      if (method === 'GET') return true;
    }

    return true;
  }
}