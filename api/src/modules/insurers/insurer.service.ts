import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Insurer } from './insurer.entity';
import { Repository } from 'typeorm';
import { CreateInsurerDto, UpdateInsurerDto } from './dto';

@Injectable()
export class InsurerService {
  constructor(@InjectRepository(Insurer) private repo: Repository<Insurer>) {}

  findOne(id: string) { return this.repo.findOne({ where: { id } }); }
  create(dto: CreateInsurerDto) { return this.repo.save(dto); }
  update(id: string, dto: UpdateInsurerDto) { return this.repo.update(id, dto); }
  remove(id: string) { return this.repo.delete(id); }
}