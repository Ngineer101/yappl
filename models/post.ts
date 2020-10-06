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

  @Column({ type: 'integer', default: false })
  isPublished: boolean;

  @ManyToOne(type => Publication, publication => publication.posts)
  publication: Publication | undefined;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date | undefined;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date | undefined;

  constructor(id: string, title: string, subtitle: string, canonicalUrl: string, htmlContent: string, textContent: string, isPublished: boolean) {
    this.id = id;
    this.title = title;
    this.subtitle = subtitle;
    this.canonicalUrl = canonicalUrl;
    this.htmlContent = htmlContent;
    this.textContent = textContent;
    this.isPublished = isPublished;
  }
}
