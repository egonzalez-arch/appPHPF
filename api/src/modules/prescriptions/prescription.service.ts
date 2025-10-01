import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Prescription } from './prescription.entity';
import { Repository } from 'typeorm';
import { CreatePrescriptionDto, UpdatePrescriptionDto } from './dto';

@Injectable()
export class PrescriptionService {
  constructor(@InjectRepository(Prescription) private repo: Repository<Prescription>) {}

  findOne(id: string) { return this.repo.findOne({ where: { id } }); }
  findByShareCode(code: string) { return this.repo.findOne({ where: { shareCode: code } }); }
  async create(dto: CreatePrescriptionDto) {
    // No prescription without valid encounter
    if (!dto.encounterId || !dto.patientId) {
      throw new BadRequestException('Prescription must reference an encounter and patient');
    }
    return this.repo.save(dto);
  }
  update(id: string, dto: UpdatePrescriptionDto) { return this.repo.update(id, dto); }
  remove(id: string) { return this.repo.delete(id); }
}
