import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { emailRegex } from "../../../../constants/emailRegex";
import { MailProviders, MailSettings, Member, Publication } from "../../../../models";
import { dbConnection } from "../../../../repository";
import crypto from 'crypto';
import mailgun from 'mailgun-js';
import { CryptoUtils } from "../../../../utils/crypto";

export default async function GenericMemberHandler(req: NextApiRequest, res: NextApiResponse) {
  const {
    method,
    query: { action, memberId },
    body
  } = req;

  const connection = await dbConnection('member');
  const memberRepository = connection.getRepository(Member);
  const mailSettingsRepository = connection.getRepository(MailSettings);

  switch (action) {
    case 'subscribe': {
      if (method === 'POST') {
        const mailSettings = await mailSettingsRepository.findOne();
        if (!mailSettings || mailSettings?.provider === MailProviders.NONE) {
          res.status(201).end('Member subscribed successfully');
          break;
        }

        if (body.email && emailRegex.test(body.email)) {
          const existingMember = await memberRepository.findOne({ email: body.email });
          if (!existingMember) {
            const token = crypto.randomBytes(36).toString('hex');
            const member = new Member(body.email, false, body.publicationId, token);
            await memberRepository.save(member);

            const publicationRepository = connection.getRepository(Publication);
            const publication = await publicationRepository.findOneOrFail({ id: body.publicationId });
            await sendVerificationMail(mailSettings, member.email, token, publication);
          }

          res.status(201).end('Member subscribed successfully');
        } else {
          res.status(400).end('Email address is not valid');
        }

        break;
      }
    }
    case 'resend-verification-mail': {
      if (method === 'GET') {
        const session = await getSession({ req });
        if (!session) {
          res.status(401).end('Unauthorized');
          break;
        }

        const mailSettings = await mailSettingsRepository.findOne();
        if (!mailSettings || mailSettings?.provider === MailProviders.NONE) {
          res.status(400).end('Emails are disabled for this publication.');
          break;
        }

        const member = await memberRepository.findOne({ id: memberId as string });
        if (member) {
          const publicationRepository = connection.getRepository(Publication);
          const publication = await publicationRepository.findOneOrFail({ id: member.publicationId });
          await sendVerificationMail(mailSettings, member.email, member.verificationToken || '', publication);
          res.status(201).end('Mail sent successfully.');
        } else {
          res.status(404).end('Member is not found.');
        }

        break;
      }
    }
    case 'delete': {
      if (method === 'DELETE') {
        const session = await getSession({ req });
        if (!session) {
          res.status(401).end('Unauthorized');
          break;
        }

        const member = await memberRepository.findOne({ id: memberId as string });
        if (member) {
          await memberRepository.remove(member);
          res.status(201).end('Member deleted successfully.');
        } else {
          res.status(404).end('Member is not found.');
        }

        break;
      }
    }
    default:
      console.log('Unknown API route specified');
      res.status(400).end('Unknown API route specified');
      break;
  }

  await connection.close();
}

async function sendVerificationMail(mailSettings: MailSettings, memberEmail: string, token: string, publication: Publication) {
  const buff = Buffer.from(memberEmail);
  const encodedEmail = buff.toString('base64');
  // TODO: make this template configurable
  const data = {
    from: `${publication.name} <${process.env.DEFAULT_EMAIL ? process.env.DEFAULT_EMAIL : `hey@${mailSettings.mailgunDomain}`}>`, // TODO: Add publication email
    to: memberEmail,
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
