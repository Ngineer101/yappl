import { NextApiRequest, NextApiResponse } from "next";
import { Member, Publication, MailProviders, MailSettings } from "../../../models";
import { dbConnection } from "../../../repository";
import crypto from 'crypto';
import { emailRegex } from "../../../constants/emailRegex";
import mailgun from 'mailgun-js';
import { CryptoUtils } from "../../../utils/crypto";

export default async function SubscribeMember(req: NextApiRequest, res: NextApiResponse) {
  const {
    method,
    body: { email, publicationId }
  } = req;

  const connection = await dbConnection('member');

  switch (method) {
    case 'POST': {
      const mailSettingsRepository = connection.getRepository(MailSettings);
      const mailSettings = await mailSettingsRepository.findOne();
      if (!mailSettings || mailSettings?.provider === MailProviders.NONE) {
        res.status(201).end('Member subscribed successfully');
        break;
      }

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
            from: `${publication.name} <${process.env.DEFAULT_EMAIL ? process.env.DEFAULT_EMAIL : `hey@${mailSettings.mailgunDomain}`}>`, // TODO: Add publication email
            to: member.email,
            subject: `Welcome to ${publication.name}`,
            html: `
            <div>
              <h4>Hi!</h4>
              <h4>Thanks for subscribing to ${publication.name}.</h4>

              <h4>Please verify your email by clicking here:</h4>
              <h4>
                <a href="${process.env.SITE_URL}/member/subscribe?e=${encodedEmail}&token=${token}" target="_blank"
                  style="padding: 0.5rem 1rem; background-color: black; color: white; border-radius: 0.5rem; text-decoration: none;">
                  <strong>verify email</strong>
                </a>
              </h4>
          
              <br />
              <br />
          
              <p><strong>Have a great day!</strong></p>
            </div>
            `,
          }

          const mg = mailgun({ apiKey: CryptoUtils.decryptKey(mailSettings.mailgunApiKey || ''), domain: mailSettings.mailgunDomain || '', host: mailSettings.mailgunHost });
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