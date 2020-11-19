import { ConnectionOptions } from "typeorm";

const connectionOptions: ConnectionOptions = {
  name: "default",
  type: "postgres",
  url: process.env.POSTGRES_DATABASE,
  schema: process.env.POSTGRES_DATABASE_SCHEMA ? process.env.POSTGRES_DATABASE_SCHEMA : 'public',
  logging: true,
  entities: [
    "models/*.ts"
  ],
  migrations: [
    "migration/**/*.ts"
  ],
  subscribers: [
    "subscriber/**/*.ts"
  ],
  cli: {
    entitiesDir: "models",
    migrationsDir: "migration",
    subscribersDir: "subscriber"
  }
};

module.exports = connectionOptions;
