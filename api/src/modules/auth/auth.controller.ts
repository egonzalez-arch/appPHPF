import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ResetPasswordDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

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
    res.cookie('jwt', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    res.cookie('refresh', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    return res.status(200).json({ user });
  }

  @Post('logout')
  async logout(@Res() res) {
    res.clearCookie('jwt');
    res.clearCookie('refresh');
    return res.status(200).json({ message: 'Logged out' });
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto, @Res() res) {
    const { accessToken, refreshToken, user } = await this.service.refresh(dto);
    res.cookie('jwt', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    res.cookie('refresh', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
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
