import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import crypto from 'crypto';
import { Post } from "../../../../models";
import { dbConnection } from "../../../../repository";

export default async function CreateNewPost(req: NextApiRequest, res: NextApiResponse) {
  const {
    method,
    query: { publicationId }
  } = req;

  const session = await getSession({ req });
  if (!session) {
    res.redirect(401, '/unauthorized');
    return;
  }

  switch (method) {
    case 'GET':
      const connection = await dbConnection('post');
      const postRepository = connection.getRepository(Post);
      const randomId = crypto.randomBytes(8).toString('hex');
      const newPost = new Post(
        '',
        '',
        randomId,
        randomId,
        '',
        '',
        '',
        session.user.name,
        publicationId as string,
        false,
        'scribeapp',
        new Date(),
        new Date()
      );

      await postRepository.save(newPost);
      await connection.close();
      res.redirect(`/publication/${publicationId}/post/${newPost.id}`).end('New post created.');
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} not allowed`);
  }
}
