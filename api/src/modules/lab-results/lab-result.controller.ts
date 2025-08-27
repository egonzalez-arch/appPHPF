import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { LabResultService } from './lab-result.service';
import { CreateLabResultDto, UpdateLabResultDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('lab-results')
@UseGuards(JwtAuthGuard)
export class LabResultController {
  constructor(private readonly service: LabResultService) {}

  @Get()
  findForPatient(@Query('patientId') patientId: string) { return this.service.findForPatient(patientId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateLabResultDto) { return this.service.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLabResultDto) { return this.service.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}