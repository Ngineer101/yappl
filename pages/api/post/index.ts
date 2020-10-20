import { NextApiRequest, NextApiResponse } from "next";
import { Post } from "../../../models";
import { dbConnection } from "../../../repository";

export default async function GetAllPosts(req: NextApiRequest, res: NextApiResponse) {
  const {
    method
  } = req;

  switch (method) {
    case 'GET':
      const connection = await dbConnection('post');
      const postRepository = connection.getRepository(Post);
      const posts = await postRepository.find();
      await connection.close();
      res.status(200).send(JSON.stringify(posts));
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} not allowed`);
  }
}
