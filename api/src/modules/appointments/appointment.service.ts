import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './appointment.entity';
import { Repository } from 'typeorm';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from './dto';
import { AppointmentStatus } from './appointment-status-enum';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { AuditEventService } from '../audit-events/audit-event.service';

interface AppointmentFilters {
  doctorId?: string;
  patientId?: string;
  clinicId?: string;
  status?: AppointmentStatus;
}

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private repo: Repository<Appointment>,
    private auditService: AuditEventService,
  ) {}

  async findOne(id: string): Promise<Appointment> {
    const a = await this.repo.findOne({ where: { id } });
    if (!a) throw new NotFoundException('Appointment not found');
    return a;
  }

  async findAll(filters: AppointmentFilters = {}): Promise<Appointment[]> {
    const qb = this.repo.createQueryBuilder('a');

    if (filters.doctorId) {
      qb.andWhere('a.doctorId = :doctorId', { doctorId: filters.doctorId });
    }
    if (filters.patientId) {
      qb.andWhere('a.patientId = :patientId', { patientId: filters.patientId });
    }
    if (filters.clinicId) {
      qb.andWhere('a.clinicId = :clinicId', { clinicId: filters.clinicId });
    }
    if (filters.status) {
      qb.andWhere('a.status = :status', { status: filters.status });
    }

    qb.orderBy('a.startAt', 'DESC');
    return qb.getMany();
  }

  async create(dto: CreateAppointmentDto) {
    const start = new Date(dto.startAt);
    const end = new Date(dto.endAt);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    if (end <= start) {
      throw new BadRequestException('endAt must be after startAt');
    }

    // Overlap check
    const overlap = await this.repo
      .createQueryBuilder('a')
      .where('a.doctorId = :doctorId', { doctorId: dto.doctorId })
      .andWhere('(a.startAt < :newEnd AND a.endAt > :newStart)', {
        newStart: start.toISOString(),
        newEnd: end.toISOString(),
      })
      .getOne();

    if (overlap) {
      throw new BadRequestException(
        'Doctor already has overlapping appointment',
      );
    }

    const appointment = this.repo.create({
      ...dto,
      startAt: start,
      endAt: end,
    });

    const result = await this.repo.save(appointment);

    await this.auditService.create({
      userId: dto.patientId, // Ajustar según tu lógica (p.ej. usuario autenticado)
      actorUserId: dto.patientId,
      timestamp: new Date(),
      description: 'Creación de cita',
      action: 'create',
      entity: 'Appointment',
      entityId: result.id,
      metadataJson: {
        clinicId: dto.clinicId,
        doctorId: dto.doctorId,
        patientId: dto.patientId,
        startAt: dto.startAt,
        endAt: dto.endAt,
        reason: dto.reason,
      },
    });

    return result;
  }

  async update(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
    const appt = await this.findOne(id);

    // Reprogramación: si se cambian ambos tiempos (o uno) validamos
    const nextStart = dto.startAt ? new Date(dto.startAt) : appt.startAt;
    const nextEnd = dto.endAt ? new Date(dto.endAt) : appt.endAt;

    if (dto.startAt || dto.endAt) {
      if (nextEnd <= nextStart) {
        throw new BadRequestException('endAt must be after startAt');
      }

      const overlap = await this.repo
        .createQueryBuilder('a')
        .where('a.doctorId = :doctorId', {
          doctorId: dto.doctorId ?? appt.doctorId,
        })
        .andWhere('(a.startAt < :newEnd AND a.endAt > :newStart)', {
          newStart: nextStart.toISOString(),
          newEnd: nextEnd.toISOString(),
        })
        .andWhere('a.id <> :id', { id })
        .getOne();

      if (overlap) {
        throw new BadRequestException(
          'Doctor already has overlapping appointment',
        );
      }
    }

    Object.assign(appt, {
      ...dto,
      startAt: dto.startAt ? nextStart : appt.startAt,
      endAt: dto.endAt ? nextEnd : appt.endAt,
    });

    await this.repo.save(appt);
    return appt;
  }

  async updateStatus(id: string, dto: UpdateAppointmentStatusDto) {
    const appt = await this.findOne(id);
    appt.status = dto.status;
    await this.repo.save(appt);
    return appt;
  }

  async remove(id: string): Promise<void> {
    const appt = await this.findOne(id);
    await this.repo.remove(appt);
  }
}