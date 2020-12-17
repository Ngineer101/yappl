import 'reflect-metadata';
import { createConnection } from 'typeorm';
import {
  User,
  Post,
  Publication,
  Member,
  Session,
  Account,
  VerificationRequest,
  MailSettings,
} from '../models';

export const dbConnection = (connectionName: string) => createConnection({
  name: connectionName,
  type: 'postgres',
  url: process.env.POSTGRES_DATABASE || "",
  entities: [
    Post,
    Publication,
    User,
    Member,
    Session,
    Account,
    VerificationRequest,
    MailSettings,
  ],
});
