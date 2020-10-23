import { NextApiRequest, NextApiResponse } from "next";
import { Post, Publication } from "../../../models";
import { dbConnection } from "../../../repository";

export default async function GetDefaultPublication(req: NextApiRequest, res: NextApiResponse) {
  const {
    method
  } = req;

  switch (method) {
    case 'GET':
      const connection = await dbConnection('publication');
      const publicationRepository = connection.getRepository(Publication);
      let publication = await publicationRepository.findOne();
      if (!publication) {
        await connection.close();
        res.status(404).end('Publication not found');
        break;
      }

      const postRepository = connection.getRepository(Post);
      const post = await postRepository.createQueryBuilder("post").where("post.isPublished = true").orderBy("post.createdAt", "DESC").getOne();
      await connection.close();

      publication.posts = post ? [post] : [];
      res.status(200).json(publication);
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} not allowed`);
  }
}
