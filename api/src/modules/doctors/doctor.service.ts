import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './doctor.entity';
import { Repository } from 'typeorm';
import { CreateDoctorDto, UpdateDoctorDto } from './dto';

@Injectable()
export class DoctorService {
  constructor(@InjectRepository(Doctor) private repo: Repository<Doctor>) {}

  findOne(id: string) { return this.repo.findOne({ where: { id } }); }
  create(dto: CreateDoctorDto) { return this.repo.save(dto); }
  update(id: string, dto: UpdateDoctorDto) { return this.repo.update(id, dto); }
  remove(id: string) { return this.repo.delete(id); }
}