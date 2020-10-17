import { NextApiRequest, NextApiResponse } from "next";
import { Post } from "../../../models";
import { dbConnection } from "../../../repository";

export default async function PostSlugHandler(req: NextApiRequest, res: NextApiResponse) {
  const {
    method,
    query: { slug }
  } = req;

  switch (method) {
    case 'GET':
      const connection = await dbConnection('post');
      const postRepository = connection.getRepository(Post);
      const post = await postRepository.findOne({ slug: slug as string });
      await connection.close();

      if (post) {
        res.status(200).end(JSON.stringify(post));
        break;
      }

      res.status(404).end();
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} not allowed`);
  }
}
