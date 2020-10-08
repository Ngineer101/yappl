import { NextApiRequest, NextApiResponse } from 'next'
import NextAuth from 'next-auth'
import Adapters from 'next-auth/adapters';
import Providers from 'next-auth/providers'
import { User } from '../../../models';

const options = {
  providers: [
    Providers.Credentials({
      name: 'Username & password',
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Username" },
        password: { label: "Password", type: "password", placeholder: "Password" }
      },
      authorize: async (credentials) => {
        // TODO: Add logic here to look up the user from the credentials supplied
        const user = {};
        if (user) {
          return Promise.resolve(user)
        } else {
          return Promise.resolve(null)
        }
      }
    }),
  ],
  database: process.env.POSTGRES_DATABASE,
  adapter: Adapters.TypeORM.Adapter({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || ""),
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE_NAME
  }, {
    models: {
      User: {
        model: User,
        schema: {
          name: "User",
          target: User,
          columns: {
            ...Adapters.TypeORM.Models.User.schema.columns,
            id: {
              type: 'varchar',
              primary: true,
              generated: 'uuid'
            },
            username: {
              type: 'varchar',
              nullable: false,
              unique: true,
            },
            passwordHash: {
              type: 'varchar',
              nullable: true,
            }
          },
        }
      },
    }
  }),
  // TODO: Add config settings for JWT authentication
}

export default (req: NextApiRequest, res: NextApiResponse<any>) => NextAuth(req, res, options)
