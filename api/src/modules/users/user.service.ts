import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole, UserStatus } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * Tipo “sanitizado” que excluye passwordHash.
 */
export type SanitizedUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  /* ---------- Sanitización ---------- */
  private sanitize(user: User | null | undefined): SanitizedUser | undefined {
    if (!user) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = user;
    return rest;
  }

  private sanitizeMany(list: User[]): SanitizedUser[] {
    return list.map((u) => this.sanitize(u)!).filter(Boolean);
  }

  /* ---------- Create ---------- */
  async create(dto: CreateUserDto): Promise<SanitizedUser> {
    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const partial: DeepPartial<User> = {
      email: dto.email,
      passwordHash,
      role: dto.role ?? UserRole.PATIENT,
      status: dto.status ?? UserStatus.ACTIVE,
      firstName: dto.firstName,
      lastName: dto.lastName,
      // Usa undefined si tu entidad no está marcada como nullable.
      // Si la tienes como @Column({ nullable: true }) phone?: string | null, puedes dejar dto.phone ?? null
      phone: dto.phone ?? undefined,
    };

    const user = this.repo.create(partial as DeepPartial<User>);
    await this.repo.save(user);
    return this.sanitize(user)!;
  }

  /* ---------- Find all ---------- */
  async findAll(): Promise<SanitizedUser[]> {
    const users = await this.repo.find();
    return this.sanitizeMany(users);
  }

  /* ---------- Find one ---------- */
  async findOne(id: string): Promise<SanitizedUser> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user)!;
  }

  /* ---------- Update ---------- */
  async update(id: string, dto: UpdateUserDto): Promise<SanitizedUser> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && dto.email !== user.email) {
      const taken = await this.repo.findOne({ where: { email: dto.email } });
      if (taken && taken.id !== id) {
        throw new ConflictException('Email already in use');
      }
      user.email = dto.email;
    }

    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.phone !== undefined) user.phone = dto.phone ?? undefined; // o null si nullable
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.status !== undefined) user.status = dto.status;

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    await this.repo.save(user);
    return this.sanitize(user)!;
  }

  /* ---------- Disable ---------- */
  async disable(id: string): Promise<SanitizedUser> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.status = UserStatus.INACTIVE;
    await this.repo.save(user);
    return this.sanitize(user)!;
  }

  /* ---------- Enable ---------- */
  async enable(id: string): Promise<SanitizedUser> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.status = UserStatus.ACTIVE;
    await this.repo.save(user);
    return this.sanitize(user)!;
  }

  /* ---------- Remove ---------- */
  async remove(id: string): Promise<void> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.repo.delete(id);
  }
}
