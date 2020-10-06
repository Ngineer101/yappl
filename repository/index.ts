import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { User, Post, Publication } from '../models';

export const dbConnection = createConnection({
  type: 'sqlite',
  database: process.env.SQLITE_DATABASE || "defaultDb",
  entities: [
    Post,
    Publication,
    User,
  ],
  synchronize: true,
}).catch(error => console.log(error));
