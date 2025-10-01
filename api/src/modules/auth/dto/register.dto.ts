import { IsEmail, IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'
import { UserRole, UserStatus } from '../../users/user.entity';

export class RegisterDto {
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
