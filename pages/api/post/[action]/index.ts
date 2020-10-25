import { NextApiRequest, NextApiResponse } from "next";
import { Post } from "../../../../models";
import { dbConnection } from "../../../../repository";

export default async function GenericPostHandler(req: NextApiRequest, res: NextApiResponse) {
  const {
    method,
    query: { action, slug }
  } = req;

  console.log(`Action: ${action}`);
  console.log(`Slug: ${slug}`);
  const connection = await dbConnection('post');
  const postRepository = connection.getRepository(Post);

  switch (action) {
    case 'all': {
      if (method === 'GET') {
        const posts = await postRepository.createQueryBuilder("post")
          .where("post.isPublished = true")
          .orderBy("post.createdAt", "DESC")
          .getMany();
        res.status(200).json(posts);
      }

      break;
    }
    case 'by-slug': {
      if (method === 'GET') {
        const post = await postRepository.findOne({ slug: slug as string });
        if (post) {
          res.status(200).json(post);
        } else {
          res.status(404).end('Post not found');
        }
      }

      break;
    }
    default:
      console.log('Unknown API route specified');
      res.status(400).end('Unknown API route specified');
      break;
  }

  await connection.close();
}
