import { GetServerSideProps } from "next";
import { Post, Publication } from "../models";
import { dbConnection } from "../repository";
import rss from 'rss';
import { Component } from "react";

export default class Feed extends Component { }

export const getServerSideProps: GetServerSideProps = async ({ res, locale }): Promise<any> => {
  if (!res) {
    return;
  }

  const { publication, posts } = await getPublicationWithPosts();
  if (!publication) {
    return;
  }

  // TODO: Investigate caching the response
  res.setHeader('Content-Type', 'text/xml');
  res.write(getFeedXml(publication, posts, locale));
  res.end();
  return { props: {} };
}

const getPublicationWithPosts = async (): Promise<{
  publication: Publication | undefined,
  posts: Post[],
}> => {
  const connection = await dbConnection('publication');
  const publicationRepository = connection.getRepository(Publication);
  const publication = await publicationRepository.findOne();
  const postRepository = connection.getRepository(Post);
  const posts = await postRepository.find({ isPublished: true });
  await connection.close();
  return {
    publication,
    posts,
  };
}

const getFeedXml = (publication: Publication, posts: Post[], locale: string | undefined) => {
  let feed = new rss({
    title: publication.name,
    description: publication.description,
    generator: 'Yappl',
    feed_url: `${process.env.SITE_URL}/feed`,
    site_url: `${process.env.SITE_URL}`,
    image_url: publication.imageUrl,
    copyright: publication.name,
    language: locale,
    pubDate: new Date().toLocaleString(),
    ttl: 1440,
  });

  // TODO: Add iTunes and Google Play custom elements

  posts.map(post =>
    feed.item({
      title: post.title,
      description: post.subtitle,
      url: post.canonicalUrl,
      author: post.authorName,
      date: post.publishedAt || '',
      enclosure: post.tileImageUrl ? { url: post.tileImageUrl } : undefined,
      // TODO: add raw content?
    }));

  const xmlString = feed.xml();
  return xmlString;
}
