import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn
} from 'typeorm';
import { Publication } from './publication';

@Entity('posts')
export class Post {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'varchar', length: 250, nullable: false, unique: false })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  subtitle: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  canonicalUrl: string;

  @Column({ type: 'varchar', nullable: true })
  htmlContent: string;

  @Column({ type: 'varchar', nullable: true })
  textContent: string;

  @Column({ type: 'bool', default: false })
  isPublished: boolean;

  @ManyToOne(type => Publication, publication => publication.posts)
  publication: Publication | undefined;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date | undefined;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date | undefined;

  constructor(title: string, subtitle: string, canonicalUrl: string, htmlContent: string, textContent: string, isPublished: boolean,
    createdDate: Date | undefined, updatedDate: Date | undefined) {
    this.title = title;
    this.subtitle = subtitle;
    this.canonicalUrl = canonicalUrl;
    this.htmlContent = htmlContent;
    this.textContent = textContent;
    this.isPublished = isPublished;
    this.createdAt = createdDate;
    this.updatedAt = updatedDate;
  }
}
