import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './appointment.entity';
import { Repository } from 'typeorm';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto';
import { AuditEventService } from '../audit-events/audit-event.service';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment) private repo: Repository<Appointment>,
    private auditService: AuditEventService,
  ) {}

  async create(dto: CreateAppointmentDto) {
    // 1. Prevent overlapping appointments per doctor
    const overlaps = await this.repo.findOne({
      where: [
        { doctorId: dto.doctorId, startAt: dto.startAt },
        { doctorId: dto.doctorId, endAt: dto.endAt }
      ]
    });
    if (overlaps) throw new BadRequestException('Doctor has overlapping appointment');

    // 2. Referential integrity (FKs checked via TypeORM)
    const appointment = this.repo.create(dto);
    const result = await this.repo.save(appointment);

    // 3. Audit logging
    await this.auditService.create({
      actorUserId: dto.patientId,
      action: 'CREATE',
      entity: 'Appointment',
      entityId: result.id,
      metadataJson: dto,
    });

    return result;
  }

  // ...other CRUD methods with audit events
}