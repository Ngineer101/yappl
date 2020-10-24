import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from 'formidable';
import csv from 'csvtojson';
import { promises as fs } from 'fs';
import { Member } from "../../../models";
import { dbConnection } from "../../../repository";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function ImportPublicationMembersHandler(req: NextApiRequest, res: NextApiResponse) {
  const {
    method,
    query: { publicationId }
  } = req;

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
        if (membersJson.length > 0) {
          const members = membersJson.map(m => new Member(m.email, false, publicationId as any, undefined));
          const connection = await dbConnection('members');
          const memberRepository = connection.getRepository(Member);
          // TODO: Check for existing members before saving
          await memberRepository.save(members);
          await connection.close();
        }

        res.status(200).json(`Successfully imported ${membersJson.length} members.`);
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
