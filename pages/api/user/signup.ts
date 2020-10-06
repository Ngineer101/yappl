import { NextApiRequest, NextApiResponse } from "next";
import { Connection } from "typeorm";
import { User } from "../../../models";
import { dbConnection } from '../../../repository';

export default function SignUpHandler(req: NextApiRequest, res: NextApiResponse) {
  const {
    body: { username, password },
    method
  } = req;

  switch (method) {
    case 'POST':
      dbConnection.then(async (connection: Connection | void) => {
        if (connection) {
          var repo = connection.getRepository(User);
          let user = new User('', username);
          // TODO: Hash password
          await repo.save(user);
          res.status(201).end();
        }
      });
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} not allowed`);
  }
}