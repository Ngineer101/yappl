import { NextApiRequest, NextApiResponse } from 'next'
import NextAuth from 'next-auth'
import Adapters from 'next-auth/adapters';
import Providers from 'next-auth/providers'
import { User } from '../../../models';
import { dbConnection } from '../../../repository';
import bcrypt from 'bcrypt';

const options = {
  providers: [
    Providers.Credentials({
      name: 'Email & password',
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Email" },
        password: { label: "Password", type: "password", placeholder: "Password" }
      },
      authorize: async (credentials: { email: string, password: string }) => {
        const connection = await dbConnection('auth');
        const existingUser = await connection.getRepository(User).findOne({ email: credentials.email });
        await connection.close();

        if (!existingUser) {
          return Promise.resolve(null);
        }

        const passwordsMatch = bcrypt.compareSync(credentials.password, existingUser.passwordHash || "");
        if (!passwordsMatch) {
          return Promise.resolve(null);
        }

        return Promise.resolve({
          email: existingUser.email,
          name: existingUser.name,
          image: existingUser.image
        });
      }
    }),
  ],
  database: process.env.POSTGRES_DATABASE,
  adapter: Adapters.TypeORM.Adapter({
    type: 'postgres',
    url: process.env.POSTGRES_DATABASE || "",
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
            passwordHash: {
              type: 'varchar',
              nullable: true,
            }
          },
        }
      },
    }
  }),
  secret: process.env.APP_SECRET,
  pages: {
    signIn: '/auth/signin'
  },
  session: {
    jwt: true, // (Use JSON Web Tokens for session instead of database sessions)
    maxAge: 7 * 24 * 60 * 60, // 30 days (Seconds - How long until an idle session expires and is no longer valid)
    updateAge: 24 * 60 * 60, // 24 hours (Seconds - Throttle how frequently to write to database to extend a session)
  },
  jwt: {
    // A secret to use for key generation - you should set this explicitly
    // Defaults to NextAuth.js secret if not explicitly specified.
    secret: process.env.JWT_SECRET,
    encryption: true,
  },
  debug: false, // TODO: Change to true for debugging output
}

export default (req: NextApiRequest, res: NextApiResponse<any>) => NextAuth(req, res, options)
