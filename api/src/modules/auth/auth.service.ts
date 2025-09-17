import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto, LoginDto, RefreshTokenDto, ResetPasswordDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
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
        secret: this.configService.get('jwt.refreshSecret'),
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

  generateToken(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.secret'),
      expiresIn: this.configService.get('jwt.expiresIn'),
    });
  }

  generateRefreshToken(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
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