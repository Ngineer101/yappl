import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

@Entity('accounts')
export class Account {

  @PrimaryGeneratedColumn()
  id: number | undefined;

  @Index({ unique: true })
  @Column({ name: 'compound_id', type: 'varchar', nullable: false })
  compoundId: string | undefined;

  @Index()
  @Column({ name: 'user_id', type: 'integer', nullable: false })
  userId: number | undefined;

  @Column({ name: 'provider_type', type: 'varchar', nullable: false })
  providerType: string | undefined;

  @Index()
  @Column({ name: 'provider_id', type: 'varchar', nullable: false })
  providerId: string | undefined;

  @Index()
  @Column({ name: 'provider_account_id', type: 'varchar', nullable: false })
  providerAccountId: string | undefined;

  @Column({ name: 'refresh_token', type: 'text' })
  refreshToken: string | undefined;

  @Column({ name: 'access_token', type: 'text' })
  accessToken: string | undefined;

  @Column({ name: 'access_token_expires', type: 'timestamp with time zone' })
  accessTokenExpires: Date | undefined;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date | undefined;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date | undefined;
}
