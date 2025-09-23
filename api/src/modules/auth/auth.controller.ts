import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, ResetPasswordDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { randomBytes } from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return await this.service.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res) {
    const { accessToken, refreshToken, user } = await this.service.login(dto);

    res.cookie('jwt', accessToken, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
    res.cookie('refresh', refreshToken, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });

    // Generar y emitir CSRF token
    const csrfToken = randomBytes(32).toString('hex');
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false, // legible por el frontend
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/', // accesible en todo el dominio
    });

    // Puedes devolver el token CSRF en el body si tu frontend lo requiere.
    return res.status(200).json({ user, csrfToken });
  }

  @Post('logout')
  async logout(@Res() res) {
    res.clearCookie('jwt');
    res.clearCookie('refresh');
    res.clearCookie('csrf_token');
    return res.status(200).json({ message: "Logged out" });
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto, @Res() res) {
    const { accessToken, refreshToken, user } = await this.service.refresh(dto);
    res.cookie('jwt', accessToken, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
    res.cookie('refresh', refreshToken, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
    // No es necesario emitir un nuevo CSRF aquí, solo en el login
    return res.status(200).json({ user });
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.service.resetPassword(dto);
  }

  @Post('validate-session')
  @UseGuards(JwtAuthGuard)
  validateSession(@Req() req) {
    return { user: req.user };
  }
}