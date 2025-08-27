import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Prescription } from '../prescriptions/prescription.entity';

@Entity('prescription_items')
export class PrescriptionItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  prescriptionId: string;

  @ManyToOne(() => Prescription)
  @JoinColumn({ name: 'prescriptionId' })
  prescription: Prescription;

  @Column()
  drugName: string;

  @Column()
  dose: string;

  @Column()
  frequency: string;

  @Column()
  duration: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}