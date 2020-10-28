import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

@Entity('verification_requests')
export class VerificationRequest {

  @PrimaryGeneratedColumn()
  id: number | undefined;

  @Column({ name: 'identifier', type: 'varchar', nullable: false })
  identifier: string | undefined;

  @Index({ unique: true })
  @Column({ name: 'token', type: 'varchar', nullable: false })
  token: string | undefined;

  @Column({ name: 'expires', type: 'timestamp with time zone', nullable: false })
  expires: Date | undefined;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date | undefined;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date | undefined;
}
