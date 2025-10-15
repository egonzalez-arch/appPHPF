import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { EncounterService } from './encounter.service';
import { CreateEncounterDto, UpdateEncounterDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('encounters')
@Controller('encounters')
@UseGuards(JwtAuthGuard)
export class EncounterController {
  constructor(private readonly service: EncounterService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un encuentro por ID' })
  @ApiParam({ name: 'id', description: 'ID del encuentro' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo encuentro' })
  @ApiBody({ type: CreateEncounterDto })
  create(@Body() dto: CreateEncounterDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un encuentro existente' })
  @ApiParam({ name: 'id', description: 'ID del encuentro' })
  @ApiBody({ type: UpdateEncounterDto })
  update(@Param('id') id: string, @Body() dto: UpdateEncounterDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un encuentro' })
  @ApiParam({ name: 'id', description: 'ID del encuentro' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}