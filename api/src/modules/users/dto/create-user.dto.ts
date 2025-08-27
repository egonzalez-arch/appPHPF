import { IsEmail, IsEnum, IsString, IsOptional } from 'class-validator';
import { UserRole, UserStatus } from '../user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}