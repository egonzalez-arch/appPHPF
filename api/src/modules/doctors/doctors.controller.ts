import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto'; // Usar el nuevo DTO
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { UpdateDoctorWithUserDto } from './dto/update-doctor-with-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

import { CreateDoctorWithUserDto } from './dto/create-doctor-with-user.dto';


@ApiTags('Doctors')
@ApiBearerAuth()
@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorsController {
  constructor(private readonly service: DoctorsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.INSURER, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Listar doctores' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.INSURER, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Obtener doctor por id' })
  @ApiParam({ name: 'id', type: 'string' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear doctor (requiere userId)' })
  @ApiResponse({ status: 201 })
  create(@Body() dto: CreateDoctorDto) {
    return this.service.create(dto);
  }

  @Post('with-user')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear doctor + usuario' })
  @ApiResponse({ status: 201 })
 createWithUser(@Body() dto: CreateDoctorWithUserDto) {
  return this.service.createWithUser(dto);
}

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar doctor (solo campos doctor)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDoctorDto,
  ) {
    return this.service.update(id, dto);
  }

  @Patch(':id/with-user')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar doctor + datos básicos del usuario' })
  updateWithUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDoctorWithUserDto,
  ) {
    return this.service.updateWithUser(id, dto);
  }

  @Post(':id/disable')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Desactivar doctor (status usuario INACTIVE)' })
  @HttpCode(HttpStatus.OK)
  disable(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.disable(id);
  }

  @Post(':id/enable')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activar doctor (status usuario ACTIVE)' })
  @HttpCode(HttpStatus.OK)
  enable(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.enable(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar doctor' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}