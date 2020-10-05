import {
  Column,
  Entity,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Publication } from './publication';

@Entity('users')
export class User {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  passwordHash: string | undefined;

  @Column({ type: 'timestamp with time zone', nullable: true })
  emailVerified: Date | undefined;

  @Column({ type: 'varchar', nullable: true })
  image: string | undefined;

  @OneToMany(type => Publication, publication => publication.user)
  publications: Publication[] | undefined;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date | undefined;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date | undefined;

  constructor(id: string, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}
