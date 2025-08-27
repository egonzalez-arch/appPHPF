import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PrescriptionItem } from './prescription-item.entity';
import { Repository } from 'typeorm';
import { CreatePrescriptionItemDto, UpdatePrescriptionItemDto } from './dto';

@Injectable()
export class PrescriptionItemService {
  constructor(@InjectRepository(PrescriptionItem) private repo: Repository<PrescriptionItem>) {}

  findOne(id: string) { return this.repo.findOne({ where: { id } }); }
  create(dto: CreatePrescriptionItemDto) { return this.repo.save(dto); }
  update(id: string, dto: UpdatePrescriptionItemDto) { return this.repo.update(id, dto); }
  remove(id: string) { return this.repo.delete(id); }
}