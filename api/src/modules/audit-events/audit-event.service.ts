import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditEvent } from './audit-event.entity';
import { Repository } from 'typeorm';
import { CreateAuditEventDto } from './dto';

@Injectable()
export class AuditEventService {
  constructor(@InjectRepository(AuditEvent) private repo: Repository<AuditEvent>) {}

  findAll(entity?: string, entityId?: string) {
    const where: any = {};
    if (entity) where.entity = entity;
    if (entityId) where.entityId = entityId;
    return this.repo.find({ where });
  }
  findOne(id: string) { return this.repo.findOne({ where: { id } }); }
  create(dto: CreateAuditEventDto) { return this.repo.save(dto); }

  
}
