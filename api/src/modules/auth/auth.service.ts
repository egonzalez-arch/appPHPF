import { Injectable, BadRequestException } from '@nestjs/common';
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
    const user = this.repo.create({ ...dto, passwordHash });
    return this.repo.save(user);
  }

  async login(dto: LoginDto, res) {
    const user = await this.repo.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new BadRequestException('Invalid credentials');
    }
    // Generate tokens, set cookies
    const payload = { sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    res.cookie('jwt', accessToken, { httpOnly: true });
    res.cookie('refresh', refreshToken, { httpOnly: true });
    return { accessToken, refreshToken, user };
  }

  async refresh(dto: RefreshTokenDto, res) {
    // Validate and rotate refresh token
    // ... (similar logic)
    return { accessToken: '...', refreshToken: '...' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.repo.findOne({ where: { email: dto.email } });
    if (!user) throw new BadRequestException('User not found');
    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.repo.save(user);
    return { ok: true };
  }
}