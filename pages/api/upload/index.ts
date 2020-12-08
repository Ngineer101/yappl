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

        const path = process.env.NODE_ENV !== "production" ? `./public/assets/uploads/${subPath}` : `/assets/uploads/${subPath}`;
        console.log(`Directory name: ${__dirname}`)
        console.log(`File name: ${__filename}`)
        const contents = await fsPromises.readFile((data as any)?.files?.image.path);
        const uploadDirExists = fs.existsSync(path);
        if (!uploadDirExists) {
          await fsPromises.mkdir(path, { recursive: true });
        }

        await fsPromises.writeFile(`${path}/${(data as any)?.files?.image.name}`, contents);
        res.status(200).json({ link: `/assets/uploads/${subPath}/${(data as any)?.files?.image.name}` });
      }
      catch (error) {
        console.log(`An error occurred while uploading the file: ${JSON.stringify(error)}`);
        res.status(500).json(error); // TODO: Revert this change
      }
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} not allowed`);
  }
}
