import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Referral } from './referral.entity';
import { Repository } from 'typeorm';
import { CreateReferralDto, UpdateReferralDto } from './dto';

@Injectable()
export class ReferralService {
  constructor(@InjectRepository(Referral) private repo: Repository<Referral>) {}

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }
  create(dto: CreateReferralDto) {
    return this.repo.save(dto);
  }
  update(id: string, dto: UpdateReferralDto) {
    return this.repo.update(id, dto);
  }
  remove(id: string) {
    return this.repo.delete(id);
  }
}
