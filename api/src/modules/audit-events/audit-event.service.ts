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
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  create(dto: CreateAuditEventDto) {
    // El DTO original no coincide con la entidad real (actorUserId, action, entity, entityId...)
    // Ajustamos mapeo mínimo:
    const mapped: Partial<AuditEvent> = {
      actorUserId: dto.actorUserId ?? dto.userId ?? 'unknown',
      action: dto.action ?? dto.description ?? 'unknown',
      entity: dto.entity ?? 'Unknown',
      entityId: dto.entityId ?? 'Unknown',
      metadataJson: dto.metadataJson ?? null,
    };
    return this.repo.save(mapped);
  }

  findByEntity(entity: string, entityId: string) {
    return this.repo.find({
      where: { entity, entityId },
      order: { createdAt: 'DESC' },
    });
  }
}