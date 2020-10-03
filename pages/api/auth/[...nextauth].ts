import { NextApiRequest, NextApiResponse } from 'next'
import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'

const options = {
  providers: [
    Providers.Twitter({
      clientId: process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || ""
    }),
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
  database: process.env.DATABASE_URL,
}

export default (req: NextApiRequest, res: NextApiResponse<any>) => NextAuth(req, res, options)
