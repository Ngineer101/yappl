import { NextApiRequest, NextApiResponse } from "next";
import { Member } from "../../../models";
import { dbConnection } from "../../../repository";
import crypto from 'crypto';
import { emailRegex } from "../../../constants/emailRegex";

export default async function SubscribeMember(req: NextApiRequest, res: NextApiResponse) {
  const {
    method,
    body: { email, publicationId }
  } = req;

  switch (method) {
    case 'POST':
      if (email && emailRegex.test(email)) {
        const connection = await dbConnection('member');
        const memberRepository = connection.getRepository(Member);
        const existingMember = await memberRepository.findOne({ email: email, publicationId: publicationId });
        if (!existingMember) {
          const token = crypto.randomBytes(36).toString('hex');
          const member = new Member(email, false, publicationId, token);
          await memberRepository.save(member);
          // TODO: Send verification email
          console.log(`Email verification token: ${token}`);
        }

        await connection.close();
      }

      res.status(201).end('Member subscribed successfully');
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} not allowed`);
  }
}