import { NextApiRequest, NextApiResponse } from "next";
import { Publication, Post, Member } from "../../../../models";
import { dbConnection } from "../../../../repository";
import { getSession } from "next-auth/client";
import axios from 'axios';
import xmlParser from 'fast-xml-parser';
import url from 'url';
import crypto from 'crypto';
import mailgun from 'mailgun-js';

export default async function GenericPublicationHandler(req: NextApiRequest, res: NextApiResponse) {
  const {
    method,
    query: { action, publicationId, postId },
    body
  } = req;

  const session = await getSession({ req });
  if (!session) {
    res.status(401).end('Unauthorized');
    return;
  }

  console.log(`Action: ${action}`);
  console.log(`PublicationId: ${publicationId}`);
  console.log(`PostId: ${postId}`);
  const connection = await dbConnection('publication');
  const publicationRepository = connection.getRepository(Publication);

  switch (action) {
    case 'import': {
      if (method === 'POST') {
        const publication = await getPublication(body.source, body.rssFeedUrl, body.userId);
        if (publication) {
          const existingPublication = await publicationRepository.findOne({ name: publication.name });
          if (!existingPublication) {
            await publicationRepository.save(publication);
            res.status(200).end(publication.id);
          } else {
            res.status(400).end('A publication with this name already exists');
          }
        } else {
          res.status(400).end('Error trying to import publication');
        }
      }

      break;
    }
    case 'new': {
      if (method === 'POST') {
        const existingPublication = await publicationRepository.findOne({ name: body.name });
        if (!existingPublication) {
          const newPublication = new Publication(body.name, body.description, body.userId);
          await publicationRepository.save(newPublication);
          res.status(200).end(newPublication.id);
        } else {
          res.status(400).end('A publication with this name already exists');
        }
      }

      break;
    }
    case 'new-post': {
      if (method === 'GET') {
        const postRepository = connection.getRepository(Post);
        const randomId = crypto.randomBytes(8).toString('hex');
        const newPost = new Post(
          '',
          '',
          randomId,
          randomId,
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
      }

      break;
    }
    case 'post': {
      const postRepository = connection.getRepository(Post);
      const post = await postRepository.findOne({ id: postId as string, publicationId: publicationId as string });

      if (method === 'GET') {
        if (!post) {
          res.status(404).end('Post not found.');
        } else {
          res.status(200).json(post);
        }
      }

      if (method === 'POST') {
        if (post) {
          post.title = body.title;
          post.subtitle = body.subTitle;
          post.htmlContent = body.htmlContent;
          post.textContent = body.textContent;
          await postRepository.save(post);
        }

        res.status(201).end('Saved post successfully.');
      }

      break;
    }
    case 'all': {
      if (method === 'GET') {
        const publications = await publicationRepository.find();
        const postRepository = connection.getRepository(Post);
        for (var i = 0; i < publications.length; i++) {
          const publicationId = publications[i].id;
          publications[i].posts = await postRepository.createQueryBuilder("post")
            .where("post.publicationId = :publicationId", { publicationId: publicationId })
            .orderBy("post.createdAt", "DESC").getMany();
        }

        res.status(200).json(publications);
      }

      break;
    }
    case 'publish-post': {
      if (method === 'POST') {
        const postRepository = connection.getRepository(Post);
        const post = await postRepository.findOne({ id: postId as string, publicationId: publicationId as string });
        if (post) {
          const slug = getSlug(post.title, post.slug);
          post.title = body.title;
          post.subtitle = body.subTitle;
          post.htmlContent = body.htmlContent;
          post.textContent = body.textContent;
          post.isPublished = true;
          post.canonicalUrl = `${process.env.SITE_URL}/p/${slug}`;
          post.slug = slug;
          post.authorName = session.user.name;
          await postRepository.save(post);

          const membersRepository = connection.getRepository(Member);
          const members = await membersRepository.find({ emailVerified: true, publicationId: publicationId as string });
          const emails = members.map(m => m.email);
          const data = {
            from: `${session.user.name} <${session.user.email}>`,
            to: emails.join(', '),
            subject: post.title,
            text: post.textContent,
            html: post.htmlContent // TODO: Insert header (with link to post) and footer (with unsubscribe link)
          }

          const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY || '', domain: process.env.MAILGUN_DOMAIN || '' });
          mg.messages().send(data, (error, response) => {
            if (error) {
              res.status(500).end('An error occurred while sending the post to members')
            } else {
              res.status(201).end(response.message)
            }
          });
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

async function getPublication(source: 'rss' | 'scribeapp', rssFeedUrl: string, userId: string): Promise<Publication | null> {
  // TODO: Check source
  const response = await axios.get(rssFeedUrl);
  if (response.data) {
    if (xmlParser.validate(response.data) === true) {
      const body: IRssFeed = xmlParser.parse(response.data);
      const channel = body.rss.channel;
      if (channel) {
        const title = channel.title;
        const description = channel.description;

        let posts: Post[] = [];
        if (channel.item.length && channel.item.length > 0) {
          posts = channel.item.map(i => {
            const postUrl = url.parse(i.guid);
            const slug = postUrl.pathname ? postUrl.pathname.replace('/p/', '') : title.replace(' ', '-')
            return new Post(
              i.title,
              i.description,
              i.guid,
              slug,
              i["content:encoded"],
              i["content:encoded"],
              i["dc:creator"],
              '',
              true,
              source,
              i.pubDate,
              i.pubDate)
          });
        } else {
          const item = (channel.item as any) as IItem
          const postUrl = url.parse(item.guid);
          const slug = postUrl.pathname ? postUrl.pathname.replace('/p/', '') : title.replace(' ', '-')
          const newPost = new Post(
            item.title,
            item.description,
            item.guid,
            slug,
            item['content:encoded'],
            item['content:encoded'],
            item['dc:creator'],
            '',
            true,
            source,
            item.pubDate,
            item.pubDate
          );

          posts = [newPost];
        }

        let publication = new Publication(title, description, userId);
        publication.posts = posts;
        return publication;
      }
    }
  }

  return null;
}

function getSlug(title: string, existingSlug: string): string {
  const titleWithoutSpaces = title.replace(' ', '-').replace('\'', '').replace(',', '-'); // TODO: Remove URL unsafe characters
  if (existingSlug) {
    return `${titleWithoutSpaces}-${existingSlug}`;
  } else {
    const randomId = crypto.randomBytes(8).toString('hex');
    return `${titleWithoutSpaces}-${randomId}`;
  }
}

interface IRssFeed {
  rss: {
    channel: {
      title: string,
      description: string,
      link: string,
      image: {
        url: string,
        title: string,
        link: string,
      },
      generator: string,
      author: string,
      item: IItem[]
    }
  }
}

interface IItem {
  title: string,
  description: string,
  link: string,
  guid: string,
  'dc:creator': string,
  pubDate: Date,
  enclosure: string,
  'content:encoded': string
}
