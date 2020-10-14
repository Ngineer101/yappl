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

  @Column({ type: 'varchar', nullable: true, unique: true })
  slug: string;

  @Column({ type: 'varchar', nullable: true })
  htmlContent: string;

  @Column({ type: 'varchar', nullable: true })
  textContent: string;

  @Column({ type: 'varchar', nullable: false })
  authorName: string;

  @Column({ type: 'bool', default: false })
  isPublished: boolean;

  @Column({ type: 'varchar', nullable: false })
  source: 'substack' | 'scribeapp';

  @ManyToOne(type => Publication, publication => publication.posts)
  publication: Publication | undefined;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date | undefined;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date | undefined;

  constructor(title: string,
    subtitle: string,
    canonicalUrl: string,
    slug: string,
    htmlContent: string,
    textContent: string,
    authorName: string,
    isPublished: boolean,
    source: 'substack' | 'scribeapp',
    createdDate: Date | undefined,
    updatedDate: Date | undefined
  ) {
    this.title = title;
    this.subtitle = subtitle;
    this.canonicalUrl = canonicalUrl;
    this.slug = slug;
    this.htmlContent = htmlContent;
    this.textContent = textContent;
    this.authorName = authorName;
    this.isPublished = isPublished;
    this.source = source;
    this.createdAt = createdDate;
    this.updatedAt = updatedDate;
  }
}
