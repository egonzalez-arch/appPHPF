import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuditEventService } from './audit-event.service';
import { CreateAuditEventDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('audit-events')
@UseGuards(JwtAuthGuard)
export class AuditEventController {
  constructor(private readonly service: AuditEventService) {}

  @Get()
  findAll(@Query('entity') entity?: string, @Query('entityId') entityId?: string) {
    return this.service.findAll(entity, entityId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateAuditEventDto) { return this.service.create(dto); }
}