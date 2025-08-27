import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LabResult } from './lab-result.entity';
import { Repository } from 'typeorm';
import { CreateLabResultDto, UpdateLabResultDto } from './dto';

@Injectable()
export class LabResultService {
  constructor(@InjectRepository(LabResult) private repo: Repository<LabResult>) {}

  findForPatient(patientId: string) { return this.repo.find({ where: { patientId } }); }
  findOne(id: string) { return this.repo.findOne({ where: { id } }); }
  create(dto: CreateLabResultDto) { return this.repo.save(dto); }
  update(id: string, dto: UpdateLabResultDto) { return this.repo.update(id, dto); }
  remove(id: string) { return this.repo.delete(id); }
}