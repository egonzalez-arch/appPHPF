import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './patient.entity';
import { Repository } from 'typeorm';
import { CreatePatientDto, UpdatePatientDto } from './dto';

@Injectable()
export class PatientService {
  constructor(@InjectRepository(Patient) private repo: Repository<Patient>) {}

  async findAll() {
    return this.repo.find({ relations: ['user'] });
  }
  async findOne(id: string) {
    return this.repo.findOne({ where: { id }, relations: ['user'] });
  }
  async create(dto: CreatePatientDto) {
    return this.repo.save(dto);
  }
  async update(id: string, dto: UpdatePatientDto) {
    return this.repo.update(id, dto);
  }
  async remove(id: string) {
    return this.repo.delete(id);
  }
}
