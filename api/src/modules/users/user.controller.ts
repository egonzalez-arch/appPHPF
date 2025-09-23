import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
// import { UserStatusService } from './dto/User-Status'; // (No usado) -> eliminar
import { User } from './user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT', 'INSURER')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // Nuevo endpoint: deshabilitar usuario (INACTIVE)
  @Post(':id/disable')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async disable(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Partial<User>> {
    const user = await this.service.disable(id); // usar this.service (no this.userService)
    return user; // ya sanitizado en el servicio
  }
}