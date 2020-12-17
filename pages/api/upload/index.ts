import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { promises as fsPromises } from 'fs';
import fs from 'fs';
import { IncomingForm } from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function GenericUploadHandler(req: NextApiRequest, res: NextApiResponse) {
  const {
    method,
    query: { subPath }
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

        const contents = await fsPromises.readFile((data as any)?.files?.image.path);
        // TODO: Upload image somewhere
        res.status(200).json({ link: '' });
      }
      catch (error) {
        console.log(`An error occurred while uploading the file: ${JSON.stringify(error)}`);
        res.status(500).end('An error occurred while uploading the file.');
      }
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} not allowed`);
  }
}
