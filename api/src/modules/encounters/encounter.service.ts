import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Encounter } from './encounter.entity';
import { Repository } from 'typeorm';
import { CreateEncounterDto, UpdateEncounterDto } from './dto';

@Injectable()
export class EncounterService {
  constructor(@InjectRepository(Encounter) private repo: Repository<Encounter>) {}

  findAll(filter?: { appointmentId?: string; status?: string; createdBy?: string }) {
    const where: any = {};
    if (filter?.appointmentId) where.appointmentId = filter.appointmentId;
    if (filter?.status) where.status = filter.status;
    if (filter?.createdBy) where.createdBy = filter.createdBy;
    return this.repo.find({ where });
  }

  findOne(id: string) { return this.repo.findOne({ where: { id } }); }

  async create(dto: CreateEncounterDto) {
    // Ahora appointmentId es obligatorio
    if (!dto.appointmentId) {
      throw new BadRequestException('Encounter must reference an appointment');
    }
    // Opcional: verifica que no exista un encounter para ese appointmentId
    const exists = await this.repo.findOne({ where: { appointmentId: dto.appointmentId } });
    if (exists) {
      throw new BadRequestException('This appointment already has an encounter assigned');
    }
    return this.repo.save(dto);
  }

  update(id: string, dto: UpdateEncounterDto) { return this.repo.update(id, dto); }
  remove(id: string) { return this.repo.delete(id); }
}