import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto, LoginDto, RefreshTokenDto, ResetPasswordDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email taken');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const { password, ...rest } = dto; // Elimina password
    const user = this.repo.create({ ...rest, passwordHash });
    return this.repo.save(user);
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    const accessToken = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);
    return { accessToken, refreshToken, user };
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      });
      const user = await this.repo.findOne({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('Usuario no encontrado');
      const accessToken = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);
      return { accessToken, refreshToken, user };
    } catch (err) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  /**
   * Genera el access token incluyendo doctorId (si existe) en el payload.
   */
  generateToken(user: User) {
    const payload: any = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // IMPORTANTE: aquí debes mapear cómo obtienes el doctorId del usuario.
    // Si tu entidad User tiene un campo doctorId:
    if ((user as any).doctorId) {
      payload.doctorId = (user as any).doctorId;
    }
    // Si en cambio tienes una relación user.doctor.id, sería algo como:
    // if ((user as any).doctor?.id) payload.doctorId = (user as any).doctor.id;

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'secret',
      expiresIn: '1h',
    });
  }

  /**
   * Genera el refresh token incluyendo doctorId (si existe) en el payload.
   */
  generateRefreshToken(user: User) {
    const payload: any = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Mismo mapeo de doctorId que arriba
    if ((user as any).doctorId) {
      payload.doctorId = (user as any).doctorId;
    }
    // o:
    // if ((user as any).doctor?.id) payload.doctorId = (user as any).doctor.id;

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      expiresIn: '7d',
    });
  }

  async validateUser(dto: LoginDto) {
    const user = await this.repo.findOne({ where: { email: dto.email } });
    if (!user) return null;
    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) return null;
    return user;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.repo.findOne({ where: { email: dto.email } });
    if (!user) throw new BadRequestException('User not found');
    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.repo.save(user);
    return { ok: true };
  }
}