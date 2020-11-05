import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

@Entity('sessions')
export class Session {

  @PrimaryGeneratedColumn()
  id: number | undefined;

  @Column({ name: 'user_id', type: 'integer', nullable: false })
  userId: number | undefined;

  @Column({ name: 'expires', type: 'timestamp with time zone', nullable: false })
  expires: Date | undefined;

  @Index({ unique: true })
  @Column({ name: 'session_token', type: 'varchar', nullable: false })
  sessionToken: string | undefined;

  @Index({ unique: true })
  @Column({ name: 'access_token', type: 'varchar', nullable: false })
  accessToken: string | undefined;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date | undefined;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date | undefined;
}
