import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FamilyHistory } from './family-history.entity';
import { Repository } from 'typeorm';
import { CreateFamilyHistoryDto, UpdateFamilyHistoryDto } from './dto';

@Injectable()
export class FamilyHistoryService {
  constructor(@InjectRepository(FamilyHistory) private repo: Repository<FamilyHistory>) {}

  findOne(id: string) { return this.repo.findOne({ where: { id } }); }
  create(dto: CreateFamilyHistoryDto) { return this.repo.save(dto); }
  update(id: string, dto: UpdateFamilyHistoryDto) { return this.repo.update(id, dto); }
  remove(id: string) { return this.repo.delete(id); }
}