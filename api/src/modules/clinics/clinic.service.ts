import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Clinic } from './clinic.entity';
import { Repository } from 'typeorm';
import { CreateClinicDto, UpdateClinicDto } from './dto';

@Injectable()
export class ClinicService {
  constructor(@InjectRepository(Clinic) private repo: Repository<Clinic>) {}

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }
  create(dto: CreateClinicDto) {
    return this.repo.save(dto);
  }
  update(id: string, dto: UpdateClinicDto) {
    return this.repo.update(id, dto);
  }
  remove(id: string) {
    return this.repo.delete(id);
  }
}
