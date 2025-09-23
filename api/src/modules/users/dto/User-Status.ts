import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../user.entity';

@Injectable()
export class UserStatusService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async disable(userId: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si ya está INACTIVE no hace nada (idempotente)
    if (user.status !== UserStatus.INACTIVE) {
      user.status = UserStatus.INACTIVE;
      await this.usersRepo.save(user);
    }

    // Sanitizar respuesta (no exponer passwordHash)
    const { passwordHash, ...safe } = user as any;
    return safe as User;
  }
}