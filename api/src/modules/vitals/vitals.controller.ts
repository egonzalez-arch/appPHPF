import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { VitalsService } from './vitals.service';
import { CreateVitalsDto, UpdateVitalsDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('vitals')
@Controller('vitals')
@UseGuards(JwtAuthGuard)
export class VitalsController {
  constructor(private readonly service: VitalsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los signos vitales (opcional: filtrar por encounter)' })
  @ApiQuery({ name: 'encounterId', required: false, type: String, description: 'Filtrar por encounterId' })
  findAll(@Query('encounterId') encounterId?: string) {
    return this.service.findAll({ encounterId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener datos de signos vitales por ID' })
  @ApiParam({ name: 'id', description: 'ID del registro de signos vitales' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @ApiOperation({ summary: 'Registrar nuevos signos vitales' })
  @ApiBody({ type: CreateVitalsDto })
  create(@Body() dto: CreateVitalsDto) { return this.service.create(dto); }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar signos vitales existentes' })
  @ApiParam({ name: 'id', description: 'ID del registro de signos vitales' })
  @ApiBody({ type: UpdateVitalsDto })
  update(@Param('id') id: string, @Body() dto: UpdateVitalsDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar registro de signos vitales' })
  @ApiParam({ name: 'id', description: 'ID del registro de signos vitales' })
  remove(@Param('id') id: string) { return this.service.remove(id); }
}