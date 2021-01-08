import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from 'formidable';
import csv from 'csvtojson';
import { promises as fs } from 'fs';
import { Member } from "../../../models";
import { dbConnection } from "../../../repository";
import { getSession } from "next-auth/client";
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function ImportPublicationMembersHandler(req: NextApiRequest, res: NextApiResponse) {
  const {
    method,
  } = req;

  const session = await getSession({ req });
  if (!session) {
    res.status(401).end('Unauthorized');
    return;
  }

  switch (method) {
    case 'POST':
      try {
        const data = await new Promise((resolve, reject) => {
          const form = new IncomingForm();
          form.parse(req, (error, fields, files) => {
            if (error) return reject(error)
            resolve({ fields, files });
          })
        });

        const contents = await fs.readFile((data as any)?.files?.members.path, { encoding: 'utf8' });
        const membersJson = await csv().fromString(contents);
        let importedMemberCount = 0;
        if (membersJson.length > 0) {
          const uploadedMembers = membersJson.map(m => new Member(m.email, true, crypto.randomBytes(36).toString('hex')));
          const connection = await dbConnection('members');
          const memberRepository = connection.getRepository(Member);

          const memberEmails = uploadedMembers.map(m => m.email);
          const duplicateMembers = await memberRepository
            .createQueryBuilder('members')
            .where("members.email IN (:...emails)", {
              emails: memberEmails,
            })
            .getMany();

          const duplicateMemberEmails = duplicateMembers.map(m => m.email);
          const membersToSave = uploadedMembers.filter(member => {
            return duplicateMemberEmails.indexOf(member.email) === -1;
          });

          importedMemberCount = membersToSave.length;
          await memberRepository.save(membersToSave);
          await connection.close();
        }

        res.status(200).json(`Successfully imported ${importedMemberCount} members.`);
      }
      catch (error) {
        res.status(500).end('An error occurred while importing members.');
      }
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} not allowed`);
  }
}
