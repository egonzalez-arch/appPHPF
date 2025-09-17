import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Encounter } from './encounter.entity';
import { Repository } from 'typeorm';
import { CreateEncounterDto, UpdateEncounterDto } from './dto';

@Injectable()
export class EncounterService {
  constructor(
    @InjectRepository(Encounter) private repo: Repository<Encounter>,
  ) {}

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateEncounterDto) {
    // Must be tied to appointment or valid patient-doctor pair
    if (!dto.appointmentId && !(dto.patientId && dto.doctorId)) {
      throw new BadRequestException(
        'Encounter must reference appointment or valid patient-doctor',
      );
    }
    return this.repo.save(dto);
  }

  update(id: string, dto: UpdateEncounterDto) {
    return this.repo.update(id, dto);
  }
  remove(id: string) {
    return this.repo.delete(id);
  }
}
