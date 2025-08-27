import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { Repository } from 'typeorm';
import { CreateCompanyDto, UpdateCompanyDto } from './dto';

@Injectable()
export class CompanyService {
  constructor(@InjectRepository(Company) private repo: Repository<Company>) {}

  findOne(id: string) { return this.repo.findOne({ where: { id } }); }
  create(dto: CreateCompanyDto) { return this.repo.save(dto); }
  update(id: string, dto: UpdateCompanyDto) { return this.repo.update(id, dto); }
  remove(id: string) { return this.repo.delete(id); }
}