import { NextApiRequest, NextApiResponse } from "next";
import { Connection } from "typeorm";
import { User } from "../../../models";
import { dbConnection } from '../../../repository';
import bcrypt from 'bcrypt';

export default function SignUpHandler(req: NextApiRequest, res: NextApiResponse) {
  const {
    body: { username, password },
    method
  } = req;

  switch (method) {
    case 'POST':
      return dbConnection.then(async (connection: Connection | void) => {
        if (connection) {
          const [existingUsers, userCount] = await connection.getRepository(User).findAndCount();
          if (userCount > 0) {
            return res.status(400).end('Admin user already exists');
          }

          let user = new User();
          user.username = username;
          user.passwordHash = bcrypt.hashSync(password, 15);
          await connection.getRepository(User).save(user);
          return res.status(200).end(user.id);
        }
      });
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} not allowed`);
  }
}