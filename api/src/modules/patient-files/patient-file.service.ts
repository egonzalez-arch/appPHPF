import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientFile } from './patient-file.entity';
import { Repository } from 'typeorm';
import { CreatePatientFileDto, UpdatePatientFileDto } from './dto';

@Injectable()
export class PatientFileService {
  constructor(
    @InjectRepository(PatientFile) private repo: Repository<PatientFile>,
  ) {}

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }
  create(dto: CreatePatientFileDto) {
    return this.repo.save(dto);
  }
  update(id: string, dto: UpdatePatientFileDto) {
    return this.repo.update(id, dto);
  }
  remove(id: string) {
    return this.repo.delete(id);
  }
}
