import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Policy } from './policy.entity';
import { Repository } from 'typeorm';
import { CreatePolicyDto, UpdatePolicyDto } from './dto';

@Injectable()
export class PolicyService {
  constructor(@InjectRepository(Policy) private repo: Repository<Policy>) {}

  findAll(patientId?: string) {
    return patientId
      ? this.repo.find({ where: { patientId } })
      : this.repo.find();
  }

  findOne(id: string) { return this.repo.findOne({ where: { id } }); }
  create(dto: CreatePolicyDto) { return this.repo.save(dto); }
  update(id: string, dto: UpdatePolicyDto) { return this.repo.update(id, dto); }
  remove(id: string) { return this.repo.delete(id); }
}
