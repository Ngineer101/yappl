import { NextApiRequest, NextApiResponse } from "next";
import { dbConnection } from "../../../../repository";
import { Publication } from '../../../../models/publication';

export default async function GetPublication(req: NextApiRequest, res: NextApiResponse) {
  const {
    method,
    query: { publicationId }
  } = req;

  switch (method) {
    case 'GET':
      if (publicationId) {
        const connection = await dbConnection('publication');
        const publicationRepository = connection.getRepository(Publication);
        const publication = await publicationRepository.findOne({ id: publicationId.toString() });
        await connection.close();

        if (publication) {
          res.status(200).end(JSON.stringify(publication));
        } else {
          res.status(404).end('Publication not found');
        }

        break;
      }

      res.status(404).end('Publication not found');
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} not allowed`);
  }
}
