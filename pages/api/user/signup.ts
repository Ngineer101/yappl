import { NextApiRequest, NextApiResponse } from "next";
import { User } from "../../../models";
import { dbConnection } from '../../../repository';
import bcrypt from 'bcrypt';

export default async function SignUp(req: NextApiRequest, res: NextApiResponse) {
  const {
    body: { email, password, name, image },
    method
  } = req;

  switch (method) {
    case 'POST':
      const connection = await dbConnection('user');
      const userRepository = connection.getRepository(User);
      const [existingUsers, userCount] = await userRepository.findAndCount();
      if (userCount > 0) {
        await connection.close();
        res.status(400).end('Admin user already exists');
        break;
      }

      let user = new User();
      user.email = email;
      user.name = name;
      user.image = image;
      user.passwordHash = bcrypt.hashSync(password, 15);
      await userRepository.save(user);
      await connection.close();
      res.status(200).end(user.id);
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} not allowed`);
  }
}