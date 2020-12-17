import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user';
import { Post } from './post';
import { MailSettings } from './mailSettings';

@Entity('publications')
export class Publication {

  @PrimaryGeneratedColumn("uuid")
  id: string | undefined;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | undefined;

  @Column({ type: 'varchar' })
  userId: string;

  @ManyToOne(type => User, user => user.publications)
  user: User | undefined;

  @Column({ type: "uuid", nullable: true })
  mailSettingsId: string | undefined;

  @OneToOne(type => MailSettings, { cascade: true, eager: false, nullable: true })
  @JoinColumn({ name: 'mailSettingsId' })
  mailSettings: MailSettings | undefined;

  @OneToMany(type => Post, post => post.publication, { cascade: true, eager: false })
  posts: Post[] | undefined;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date | undefined;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date | undefined;

  constructor(name: string, description: string, userId: string, imageUrl: string | undefined) {
    this.name = name;
    this.description = description;
    this.userId = userId;
    this.imageUrl = imageUrl;
  }
}
