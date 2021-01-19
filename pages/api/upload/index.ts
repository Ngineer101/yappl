import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { promises as fsPromises } from 'fs';
import fs from 'fs';
import { IncomingForm } from "formidable";
import cloudinary from 'cloudinary';

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

        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
          cloudinary.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          });

          const response = await cloudinary.v2.uploader.upload((data as any)?.files?.image.path, {
            public_id: subPath && subPath.length > 0 ? `yappl_uploads/${subPath}` : 'yappl_uploads',
          });
          res.status(200).json({ link: response.secure_url });
        } else {
          res.status(400).end('Image uploads are not enabled.'); // TODO: Improve error message
        }
      }
      catch (error) {
        res.status(500).end('An error occurred while uploading the image.');
      }
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} not allowed`);
  }
}
