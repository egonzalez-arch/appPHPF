import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Encounter } from '../encounters/encounter.entity';

@Entity('vitals')
export class Vitals {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  encounterId: string;

  @ManyToOne(() => Encounter)
  @JoinColumn({ name: 'encounterId' })
  encounter: Encounter;

  @Column('float')
  height: number;

  @Column('float')
  weight: number;

  @Column('float')
  bmi: number;

  @Column('int')
  hr: number;

  @Column()
  bp: string;

  @Column('float')
  spo2: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  recordedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
