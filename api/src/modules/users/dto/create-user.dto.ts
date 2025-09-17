import { IsEmail, IsEnum, IsString, IsOptional } from 'class-validator';
import { UserRole, UserStatus } from '../user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}
