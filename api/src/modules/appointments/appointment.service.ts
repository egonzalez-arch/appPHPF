import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './appointment.entity';
import { Repository } from 'typeorm';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto';
import { AuditEventService } from '../audit-events/audit-event.service';
import { AppointmentStatus } from './appointment-status-enum';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment) private repo: Repository<Appointment>,
    private auditService: AuditEventService,
  ) {}

  async findOne(id: string): Promise<Appointment | null> {
    return this.repo.findOne({ where: { id } });
  }
  

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
  userId: dto.patientId,                 // El usuario responsable, ajusta si es otro
  timestamp: new Date(),                 // Fecha/hora actual
  description: 'Creación de cita',       // Explica la acción, ajústalo a tu necesidad
  actorUserId: dto.patientId,            // Quien realiza la acción
  action: 'create',                      // El tipo de acción
  entity: 'Appointment',                 // Entidad afectada
  entityId: result.id,                   // Id de la cita creada
  metadataJson: dto,                     // Datos relevantes adicionales
});

    return result;
  }

  async remove(id: string): Promise<any> {
    return await this.repo.delete(id);
  }

  
async updateStatus(id: string, status: string): Promise<any> {
  // Validar que el status es parte del enum
  if (!Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
    throw new Error(`Invalid status value: ${status}`);
  }

  await this.repo.update(id, { status: status as AppointmentStatus });
  return await this.repo.findOne({ where: { id } });
}


  async update(id: string, dto: UpdateAppointmentDto): Promise<Appointment | undefined> {
    await this.repo.update(id, dto);
    return (await this.repo.findOne({ where: { id } })) ?? undefined;
  }
  // ...other CRUD methods with audit events
}