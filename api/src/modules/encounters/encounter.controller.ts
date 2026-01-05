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
import { EncounterService } from './encounter.service';
import { CreateEncounterDto, UpdateEncounterDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AppointmentService } from '../appointments/appointment.service';
import { AuditEventService } from '../audit-events/audit-event.service';

@ApiTags('encounters')
@Controller('encounters')
@UseGuards(JwtAuthGuard)
export class EncounterController {
  constructor(
    private readonly service: EncounterService,
    private readonly appointmentsService: AppointmentService,
    private readonly auditEventService: AuditEventService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener listado de todos los encuentros' })
  @ApiQuery({ name: 'appointmentId', required: false, type: String, description: 'Filtrar por appointmentId' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'createdBy', required: false, type: String, description: 'Filtrar por usuario creador' })
  findAll(@Query('appointmentId') appointmentId?: string, @Query('status') status?: string, @Query('createdBy') createdBy?: string) {
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
   * Restricción de seguridad: si el payload incluye appointmentId, solo el doctor asignado a
   * esa cita (appointment.doctorId) puede iniciar/crear el encuentro.
   *
   * Registra en audit-events intentos denegados y creaciones exitosas.
   */
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo encuentro' })
  @ApiBody({ type: CreateEncounterDto })
  async create(@Body() dto: CreateEncounterDto, @Req() req: Request) {
    // Si viene appointmentId validar permisos
    if (dto.appointmentId) {
      const appt = await this.appointmentsService.findOne(dto.appointmentId);
      if (!appt) {
        throw new BadRequestException('Appointment not found');
      }

      // Determinar user id desde request (depende de tu estrategia JWT)
      const userId = (req as any).user?.id ?? (req as any).user?.sub ?? null;
      const userDoctorId = (req as any).user?.doctorId ?? null;

      const allowed =
        appt.doctorId &&
        ( (userId && appt.doctorId === userId) || (userDoctorId && appt.doctorId === userDoctorId) );

      if (!allowed) {
        // Registrar intento denegado en audit-events (no bloquear respuesta)
        try {
          await this.auditEventService.create({
            // CreateAuditEventDto expects userId and timestamp/description — service.create maps fields
            userId: userId ?? 'unknown',
            timestamp: new Date().toISOString(),
            description: 'attempt to create encounter denied: not assigned doctor',
            actorUserId: userId ?? undefined,
            action: 'encounter.create_denied',
            entity: 'appointment',
            entityId: dto.appointmentId,
            metadataJson: { reason: 'not_assigned_doctor' },
          } as any);
        } catch (err) {
          // swallow audit errors
        }

        throw new ForbiddenException('Solo el doctor asignado puede iniciar el encuentro.');
      }
    }

    const created = await this.service.create(dto);

    // Registrar evento de auditoría de creación exitosa
    try {
      const userId = (req as any).user?.id ?? (req as any).user?.sub ?? 'unknown';
      await this.auditEventService.create({
        userId,
        timestamp: new Date().toISOString(),
        description: 'encounter created',
        actorUserId: userId,
        action: 'encounter.create',
        entity: 'encounter',
        entityId: (created as any)?.id ?? dto.appointmentId ?? null,
        metadataJson: {
          appointmentId: (created as any)?.appointmentId ?? dto.appointmentId ?? null,
          status: (created as any)?.status ?? null,
        },
      } as any);
    } catch (err) {
      // ignore audit failures
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