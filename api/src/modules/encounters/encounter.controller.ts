'use strict';

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  Req,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';

import { EncounterService } from './encounter.service';
import { CreateEncounterDto, UpdateEncounterDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AppointmentService } from '../appointments/appointment.service';
import { AuditEventService } from '../audit-events/audit-event.service';
import { Doctor } from '../doctors/doctors.entity';

function isValidUuid(v?: string | null) {
  if (!v) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );
}

@ApiTags('encounters')
@Controller('encounters')
@UseGuards(JwtAuthGuard)
export class EncounterController {
  constructor(
    private readonly service: EncounterService,
    private readonly appointmentsService: AppointmentService,
    private readonly auditEventService: AuditEventService,
    @InjectRepository(Doctor)
    private readonly doctorsRepo: Repository<Doctor>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener listado de todos los encuentros' })
  @ApiQuery({
    name: 'appointmentId',
    required: false,
    type: String,
    description: 'Filtrar por appointmentId',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filtrar por estado',
  })
  @ApiQuery({
    name: 'createdBy',
    required: false,
    type: String,
    description: 'Filtrar por usuario creador',
  })
  findAll(
    @Query('appointmentId') appointmentId?: string,
    @Query('status') status?: string,
    @Query('createdBy') createdBy?: string,
  ) {
    return this.service.findAll({ appointmentId, status, createdBy });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un encuentro por ID' })
  @ApiParam({ name: 'id', description: 'ID del encuentro' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  /**
   * Crear un nuevo encuentro.
   * Regla de seguridad:
   *  - ADMIN siempre puede.
   *  - DOCTOR solo si el Doctor vinculado a su userId es el mismo que appointment.doctorId.
   *  - Otros roles: denegado.
   */
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo encuentro' })
  @ApiBody({ type: CreateEncounterDto })
  async create(@Body() dto: CreateEncounterDto, @Req() req: Request) {
    const authUser: any = (req as any).user;

    if (dto.appointmentId) {
      const appt = await this.appointmentsService.findOne(dto.appointmentId);
      if (!appt) {
        throw new BadRequestException('Appointment not found');
      }

      const userRole = authUser?.role;
      // JwtStrategy -> { userId, email, role }
      const rawUserId = authUser?.userId ?? null;
      const userId = typeof rawUserId === 'string' ? rawUserId : null;

      // ADMIN puede crear siempre
      if (userRole !== 'ADMIN') {
        if (userRole !== 'DOCTOR') {
          throw new ForbiddenException(
            'Solo médicos pueden iniciar encuentros.',
          );
        }

        // Si no tenemos un UUID válido, no podemos mapear a Doctor -> denegamos limpamente
        if (!isValidUuid(userId)) {
          await this.auditEventService
            .create({
              userId: userId ?? 'unknown',
              timestamp: new Date().toISOString(),
              description:
                'attempt to create encounter denied: invalid userId for doctor mapping',
              actorUserId: userId ?? undefined,
              action: 'encounter.create_denied',
              entity: 'appointment',
              entityId: dto.appointmentId,
              metadataJson: {
                reason: 'invalid_user_id_uuid',
                rawUserId,
                role: userRole,
              },
            } as any)
            .catch(() => {});
          throw new ForbiddenException(
            'Solo el doctor asignado puede iniciar el encuentro.',
          );
        }

        // Resolver Doctor.id desde la tabla doctors usando el userId del JWT
        const doctor = await this.doctorsRepo.findOne({
          where: { userId: userId as string },
        });

        const doctorIdFromUser = doctor?.id ?? null;
        const appointmentDoctorId = appt.doctorId
          ? String(appt.doctorId)
          : null;

        const allowed =
          doctorIdFromUser &&
          appointmentDoctorId &&
          appointmentDoctorId === doctorIdFromUser;

        if (!allowed) {
          await this.auditEventService
            .create({
              userId: userId as string,
              timestamp: new Date().toISOString(),
              description:
                'attempt to create encounter denied: not assigned doctor',
              actorUserId: userId as string,
              action: 'encounter.create_denied',
              entity: 'appointment',
              entityId: dto.appointmentId,
              metadataJson: {
                reason: 'not_assigned_doctor',
                appointmentDoctorId,
                doctorIdFromUser,
                role: userRole,
              },
            } as any)
            .catch(() => {});

          throw new ForbiddenException(
            'Solo el doctor asignado puede iniciar el encuentro.',
          );
        }
      }
    }

    const created = await this.service.create(dto);

    // Audit de creación exitosa
    try {
      const userIdFinal =
        (authUser?.userId as string) ?? 'unknown';
      await this.auditEventService.create({
        userId: userIdFinal,
        timestamp: new Date().toISOString(),
        description: 'encounter created',
        actorUserId: userIdFinal,
        action: 'encounter.create',
        entity: 'encounter',
        entityId: (created as any)?.id ?? dto.appointmentId ?? null,
        metadataJson: {
          appointmentId:
            (created as any)?.appointmentId ?? dto.appointmentId ?? null,
          status: (created as any)?.status ?? null,
        },
      } as any);
    } catch {
      // ignorar errores de auditoría
    }

    return created;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un encuentro existente' })
  @ApiParam({ name: 'id', description: 'ID del encuentro' })
  @ApiBody({ type: UpdateEncounterDto })
  update(@Param('id') id: string, @Body() dto: UpdateEncounterDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un encuentro' })
  @ApiParam({ name: 'id', description: 'ID del encuentro' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}