import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

@Entity('members')
export class Member {

  @PrimaryGeneratedColumn('uuid')
  id: string | undefined;

  @Index()
  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | undefined;

  @Column({ type: 'bool', nullable: false, default: false })
  emailVerified: boolean;

  @Index()
  @Column({ type: 'uuid', nullable: false })
  publicationId: string;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  verificationToken: string | undefined;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date | undefined;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date | undefined;

  constructor(email: string, emailVerified: boolean, publicationId: string, verificationToken: string | undefined) {
    this.email = email;
    this.emailVerified = emailVerified;
    this.publicationId = publicationId;
    this.verificationToken = verificationToken;
  }
}
