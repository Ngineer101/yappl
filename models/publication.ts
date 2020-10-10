import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn
} from 'typeorm';
import { User } from './user';
import { Post } from './post';

@Entity('publications')
export class Publication {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'varchar' })
  userId: string;

  @ManyToOne(type => User, user => user.publications)
  user: User | undefined;

  @OneToMany(type => Post, post => post.publication, { cascade: true, eager: true })
  posts: Post[] | undefined;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date | undefined;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date | undefined;

  constructor(name: string, description: string, userId: string) {
    this.name = name;
    this.description = description;
    this.userId = userId;
  }
}
