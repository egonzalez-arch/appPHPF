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
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  UpdateAppointmentStatusDto,
} from './dto';
import { AppointmentStatus } from './appointment-status-enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AppointmentPermissionsGuard } from './appointment-permissions.guard';
import { AuditEventService } from '../audit-events/audit-event.service';

@Controller('appointments')
@UseGuards(JwtAuthGuard, AppointmentPermissionsGuard)
export class AppointmentController {
  constructor(
    private readonly service: AppointmentService,
    private readonly audit: AuditEventService,
  ) {}

  @Get()
  findAll(
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string,
    @Query('clinicId') clinicId?: string,
    @Query('status') status?: AppointmentStatus,
  ) {
    return this.service.findAll({ doctorId, patientId, clinicId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/audit')
  auditTrail(@Param('id') id: string) {
    return this.audit.findByEntity('Appointment', id);
  }

  @Post()
  create(@Body() dto: CreateAppointmentDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}