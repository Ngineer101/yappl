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
  name: string | undefined;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string | undefined;

  @Column({ type: 'string', unique: true, nullable: false })
  username: string;

  @Column({ type: 'varchar', nullable: true })
  passwordHash: string | undefined;

  @Column({ type: 'datetime', nullable: true })
  emailVerified: Date | undefined;

  @Column({ type: 'varchar', nullable: true })
  image: string | undefined;

  @OneToMany(type => Publication, publication => publication.user)
  publications: Publication[] | undefined;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date | undefined;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date | undefined;

  constructor(id: string, username: string) {
    this.id = id;
    this.username = username;
  }
}
