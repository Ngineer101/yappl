import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity('mailSettings')
export class MailSettings {

  @PrimaryGeneratedColumn("uuid")
  id: string | undefined;

  @Column({ type: 'varchar', nullable: false, unique: true, default: "none" })
  provider: MailProviders;

  @Column({ type: 'varchar', nullable: true })
  mailgunApiKey: string | undefined;

  @Column({ type: 'varchar', nullable: true })
  mailgunDomain: string | undefined;

  @Column({ type: 'varchar', nullable: true })
  mailgunHost: string | undefined;

  constructor(provider: MailProviders) {
    this.provider = provider;
  }
}

export enum MailProviders {
  NONE = "none",
  MAILGUN = "mailgun",
}
