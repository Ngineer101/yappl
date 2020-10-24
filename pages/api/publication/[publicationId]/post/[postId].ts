import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { Post } from "../../../../../models";
import { dbConnection } from "../../../../../repository";

export default async function HandlePost(req: NextApiRequest, res: NextApiResponse) {
  const {
    method,
    query: { publicationId, postId },
    body,
  } = req;

  // TODO: Fix authentication
  // const session = await getSession({ req });
  // console.log(`Session: ${JSON.stringify(session)}`)
  // if (!session) {
  //   res.status(401).end('Please sign in to edit a post.');
  //   return;
  // }

  const connection = await dbConnection('post');
  const postRepository = connection.getRepository(Post);
  const post = await postRepository.findOne({ id: postId as string, publicationId: publicationId as string });

  switch (method) {
    case 'GET':
      if (!post) {
        res.status(404).end('Post not found.');
      } else {
        res.status(200).json(post);
      }
      break;
    case 'POST':
      if (post) {
        post.title = body.title;
        post.subtitle = body.subTitle;
        post.htmlContent = body.htmlContent;
        post.textContent = body.textContent;
        await postRepository.save(post);
      }

      res.status(201).end('Saved post successfully.');
      break;
    default:
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${method} not allowed`);
  }

  await connection.close();
}
