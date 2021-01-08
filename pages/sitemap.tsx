import { GetServerSideProps } from "next";
import { Component } from "react";
import { SitemapStream, streamToPromise } from "sitemap";
import { Post } from "../models";
import { dbConnection } from "../repository";

export default class Sitemap extends Component { }

export const getServerSideProps: GetServerSideProps = async ({ res }): Promise<any> => {
  if (!res) {
    return;
  }

  const posts = await getPosts();
  const sitemapStream = new SitemapStream({
    hostname: process.env.SITE_URL,
  });

  posts.map(post =>
    sitemapStream.write({
      url: post.canonicalUrl,
      changefreq: 'weekly',
      priority: 0.9,
    })
  );

  sitemapStream.end();
  const sitemapOutput = (await streamToPromise(sitemapStream)).toString();
  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemapOutput); // TODO: Investigate caching response
  res.end();
  return { props: {} };
}

const getPosts = async (): Promise<Post[]> => {
  const connection = await dbConnection('posts');
  const postRepository = connection.getRepository(Post);
  const posts = await postRepository.find({ isPublished: true });
  await connection.close();
  return posts;
}
