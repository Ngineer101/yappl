import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  Index
} from 'typeorm';
import { Publication } from './publication';

@Entity('posts')
export class Post {

  @PrimaryGeneratedColumn("uuid")
  id: string | undefined;

  @Column({ type: 'varchar', length: 250, nullable: false, unique: false })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  subtitle: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  canonicalUrl: string;

  @Index()
  @Column({ type: 'varchar', nullable: true, unique: true })
  slug: string;

  @Column({ type: 'varchar', nullable: true })
  htmlContent: string;

  @Column({ type: 'varchar', nullable: true })
  rawContent: string;

  @Column({ type: 'varchar', nullable: false })
  authorName: string;

  @Column({ type: 'varchar', nullable: true })
  authorImage: string;

  @Column({ type: 'bool', default: false })
  isPublished: boolean;

  @Column({ type: 'varchar', nullable: false })
  source: 'rss' | 'yappl';

  @Column({ type: 'uuid', nullable: false })
  publicationId: string;

  @ManyToOne(type => Publication, publication => publication.posts)
  publication: Publication | undefined;

  @Column({ type: 'timestamp with time zone', nullable: true })
  publishedAt: Date | undefined;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date | undefined;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date | undefined;

  constructor(title: string,
    subtitle: string,
    canonicalUrl: string,
    slug: string,
    htmlContent: string,
    rawContent: string,
    authorName: string,
    authorImage: string,
    publicationId: string,
    isPublished: boolean,
    source: 'rss' | 'yappl',
    createdDate: Date | undefined,
    updatedDate: Date | undefined
  ) {
    this.title = title;
    this.subtitle = subtitle;
    this.canonicalUrl = canonicalUrl;
    this.slug = slug;
    this.htmlContent = htmlContent;
    this.rawContent = rawContent;
    this.authorName = authorName;
    this.authorImage = authorImage;
    this.publicationId = publicationId;
    this.isPublished = isPublished;
    this.source = source;
    this.createdAt = createdDate;
    this.updatedAt = updatedDate;
  }
}
