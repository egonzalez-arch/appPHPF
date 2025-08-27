import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

export enum PatientSex {
  M = 'M',
  F = 'F',
  O = 'O',
}

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'date' })
  birthDate: Date;

  @Column({ type: 'enum', enum: PatientSex })
  PatientSex: PatientSex;

  @Column({ nullable: true })
  bloodType: string;

  @Column({ type: 'json', nullable: true })
  allergies: string[];

  @Column({ type: 'json', nullable: true })
  emergencyContact: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}