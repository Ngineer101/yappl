import { NextApiRequest, NextApiResponse } from "next";
import { Publication, Post } from "../../../models";
import { dbConnection } from '../../../repository';
import xmlParser from 'fast-xml-parser';
import axios from 'axios';

export default async function PublicationImportHandler(req: NextApiRequest, res: NextApiResponse) {
  const {
    body: {
      userId,
      rssFeedUrl,
      source
    },
    method
  } = req;

  switch (method) {
    case 'POST':
      const publication = await getPublication(source, rssFeedUrl, userId);
      if (publication) {
        const connection = await dbConnection('publication');
        const publicationRepository = connection.getRepository(Publication);
        await publicationRepository.save(publication);
        await connection.close();
        res.status(200).end(publication.id);
        break;
      }

      res.status(400).end('Error trying to import publication');
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} not allowed`);
  }
}

async function getPublication(source: 'substack' | 'ghost', rssFeedUrl: string, userId: string): Promise<Publication | null> {
  // TODO: Check source
  const response = await axios.get(rssFeedUrl);
  if (response.data) {
    if (xmlParser.validate(response.data) === true) {
      const body: IRssFeed = xmlParser.parse(response.data);
      const channel = body.rss.channel;
      if (channel) {
        const title = channel.title;
        const description = channel.description;
        const posts = channel.item.map(i => new Post(
          i.title,
          i.description,
          i.guid,
          i["content:encoded"],
          '',
          true,
          i.pubDate,
          i.pubDate));

        let publication = new Publication(title, description, userId);
        publication.posts = posts;
        return publication;
      }
    }
  }

  return null;
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
      item: {
        title: string,
        description: string,
        link: string,
        guid: string,
        'dc:creator': string,
        pubDate: Date,
        enclosure: string,
        'content:encoded': string
      }[]
    }
  }
}
