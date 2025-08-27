import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vitals } from './vitals.entity';
import { Repository } from 'typeorm';
import { CreateVitalsDto, UpdateVitalsDto } from './dto';

@Injectable()
export class VitalsService {
  constructor(@InjectRepository(Vitals) private repo: Repository<Vitals>) {}

  findOne(id: string) { return this.repo.findOne({ where: { id } }); }
  create(dto: CreateVitalsDto) { 
    dto.bmi = dto.weight / ((dto.height / 100) ** 2); // BMI calculation
    return this.repo.save(dto); 
  }
  update(id: string, dto: UpdateVitalsDto) { return this.repo.update(id, dto); }
  remove(id: string) { return this.repo.delete(id); }
}