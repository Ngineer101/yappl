import { NextApiRequest, NextApiResponse } from "next";
import { Member, Publication } from "../../../models";
import { dbConnection } from "../../../repository";
import crypto from 'crypto';
import { emailRegex } from "../../../constants/emailRegex";
import mailgun from 'mailgun-js';

export default async function SubscribeMember(req: NextApiRequest, res: NextApiResponse) {
  const {
    method,
    query: { e, token },
    body: { email, publicationId }
  } = req;

  const connection = await dbConnection('member');

  switch (method) {
    case 'GET': {
      const buff = Buffer.from(e as string, 'base64');
      const decodedEmail = buff.toString('ascii');
      const memberRepository = connection.getRepository(Member);
      const member = await memberRepository.findOne({ email: decodedEmail, verificationToken: token as string });
      if (member) {
        member.emailVerified = true;
        await memberRepository.save(member);
        res.redirect('/email-verified');
      } else {
        res.redirect('/404');
      }

      break;
    }
    case 'POST': {
      if (email && emailRegex.test(email)) {
        const memberRepository = connection.getRepository(Member);
        const existingMember = await memberRepository.findOne({ email: email, publicationId: publicationId });
        if (!existingMember) {
          const token = crypto.randomBytes(36).toString('hex');
          const member = new Member(email, false, publicationId, token);
          await memberRepository.save(member);

          const publicationRepository = connection.getRepository(Publication);
          const publication = await publicationRepository.findOneOrFail({ id: publicationId });
          const buff = Buffer.from(email)
          const encodedEmail = buff.toString('base64');
          // TODO: make this template configurable
          const data = {
            from: `${publication.name} <${process.env.DEFAULT_EMAIL}>`, // TODO: Add publication email
            to: member.email,
            subject: `Welcome to ${publication.name}`,
            html: `
            <div>
              <h4>Hi!</h4>
              <h4>Thanks for subscribing to ${publication.name}</h4>

              <p>Please verify your email by clicking here:
                <a href="${process.env.SITE_URL}/api/member/subscribe?e=${encodedEmail}&token=${token}" target="_blank">
                  <strong>verify email</strong>
                </a>
              </p>

              <p>Cheers</p>
              <p>${publication.name}</p>
            </div>
            `,
          }

          const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY || '', domain: process.env.MAILGUN_DOMAIN || '' });
          await mg.messages().send(data, (error, response) => {
            if (error) {
              console.log(`Error sending email: ${JSON.stringify(error)}`);
            } else {
              console.log(`Email response: ${JSON.stringify(response)}`);
            }
          });
        }

        res.status(201).end('Member subscribed successfully');
      } else {
        res.status(400).end('Email address is not valid');
      }

      break;
    }
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} not allowed`);
  }

  await connection.close();
}