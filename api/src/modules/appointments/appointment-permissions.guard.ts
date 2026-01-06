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

    // Permitir auditoría a cualquier usuario autenticado
    if (method === 'GET' && url.includes('/audit')) {
      return true;
    }

    // Creation
    if (method === 'POST' && url.endsWith('/appointments')) {
      if (user.role === 'PATIENT') {
        // aquí podrías validar relación paciente-usuario si quieres
      }
      return true;
    }

    // If not referencing an existing resource (listing/filtros)
    const id = request.params.id;
    if (!id) return true;

    const appt = await this.appointments.findOne(id);

    // DOCTOR
    if (user.role === 'DOCTOR') {
      // Opcional: si quieres seguir exigiendo doctorId en user, déjalo; si no, comenta:
      // if (!user.doctorId) {
      //   throw new ForbiddenException('DoctorId no presente en el token');
      // }

      if (method === 'DELETE') {
        // si tienes doctorId en user, puedes comparar; si no, permite o bloquea según tu modelo
        // if (appt.doctorId !== user.doctorId) {
        //   throw new ForbiddenException('No puedes eliminar citas de otros doctores');
        // }
        if (appt.status !== AppointmentStatus.PENDING) {
          throw new ForbiddenException('Solo puedes eliminar citas pendientes');
        }
        return true;
      }

      if (method === 'PATCH' && url.includes('/status')) {
        // RELAJADO: no comparamos appt.doctorId con user.doctorId por ahora
        const newStatus = request.body.status as AppointmentStatus;

        const allowed: AppointmentStatus[] = [
          AppointmentStatus.PENDING,
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
        // si tienes doctorId en user, puedes comparar aquí
        // if (appt.doctorId !== user.doctorId) {
        //   throw new ForbiddenException('No puedes actualizar otra cita');
        // }
        return true;
      }

      if (method === 'GET') return true;
    }

    // PATIENT
    if (user.role === 'PATIENT') {
      if (method === 'DELETE') {
        throw new ForbiddenException(
          'El paciente no puede eliminar citas (use cancelación).',
        );
      }
      if (method === 'PATCH' && url.includes('/status')) {
        const newStatus = request.body.status as AppointmentStatus;
        if (newStatus !== AppointmentStatus.CANCELLED) {
          throw new ForbiddenException('Solo puedes cancelar tu cita');
        }
        return true;
      }
      if (method === 'PATCH') {
        throw new ForbiddenException(
          'El paciente no puede reprogramar directamente.',
        );
      }
      if (method === 'GET') return true;
    }

    // Otros roles (si los hay)
    return true;
  }
}