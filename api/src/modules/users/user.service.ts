import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findAll() { return this.repo.find(); }
  findOne(id: string) { return this.repo.findOne({ where: { id } }); }
  create(dto: CreateUserDto) { return this.repo.save(dto); }
  update(id: string, dto: UpdateUserDto) { return this.repo.update(id, dto); }
  remove(id: string) { return this.repo.delete(id); }
}