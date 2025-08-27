import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, ResetPasswordDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) { return this.service.register(dto); }

  @Post('login')
  login(@Body() dto: LoginDto, @Res() res) { return this.service.login(dto, res); }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto, @Res() res) { return this.service.refresh(dto, res); }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) { return this.service.resetPassword(dto); }

  @Post('validate-session')
  @UseGuards(JwtAuthGuard)
  validateSession(@Req() req) { return { user: req.user }; }
}