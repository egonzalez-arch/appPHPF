import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { CreatePolicyDto, UpdatePolicyDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('policies')
@UseGuards(JwtAuthGuard)
export class PolicyController {
  constructor(private readonly service: PolicyService) {}

  @Get()
  findAll(@Query('patientId') patientId?: string) { return this.service.findAll(patientId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreatePolicyDto) { return this.service.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePolicyDto) { return this.service.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}