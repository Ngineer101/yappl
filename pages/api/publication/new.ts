import { NextApiRequest, NextApiResponse } from "next";
import { Publication } from "../../../models";
import { dbConnection } from "../../../repository";

export default async function NewPublicationHandler(req: NextApiRequest, res: NextApiResponse) {
  const {
    body: {
      userId,
      name,
      description
    },
    method
  } = req;

  switch (method) {
    case 'POST':
      const connection = await dbConnection('publication');
      const publicationRepository = connection.getRepository(Publication);
      const existingPublication = await publicationRepository.findOne({ name: name });
      if (!existingPublication) {
        const newPublication = new Publication(name, description, userId);
        await publicationRepository.save(newPublication);
        await connection.close();
        res.status(200).end(newPublication.id);
        break;
      }

      await connection.close();
      res.status(400).end('A publication with this name already exists');
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} not allowed`);
  }
}
