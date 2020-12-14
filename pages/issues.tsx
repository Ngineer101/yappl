import { GetStaticProps } from "next";
import Link from 'next/link';
import Container from '../components/container';
import { Post } from "../models";
import { dbConnection } from "../repository";
import Head from 'next/head';

export default function Issues(props: any) {
  const posts: Post[] = props.posts || [];
  return (
    <Container>
      <Head>
        <title>Past Issues</title>
      </Head>
      <div className='flex flex-col justify-center items-center px-1'>
        <h1 className='text-3xl sm:text-3xl md:text-5xl lg:text-5xl xl:text-5xl text-center mb-2 mt-8'>Past Issues</h1>
        {
          posts.length > 0 ?
            posts.map((p, i) =>
              <div key={i} className='issue-card adjusted-width'>
                <h3 className='text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl text-center'>{p.title}</h3>
                <p className='text-base sm:text-base md:text-lg lg:text-lg xl:text-lg text-center text-gray-600'>{p.subtitle}</p>
                <Link href={`/p/${p.slug}`}>
                  <a className='mt-8 text-blue-500 text-base sm:text-base md:text-xl lg:text-xl xl:text-xl text-center'>Read issue</a>
                </Link>
              </div>
            )
            :
            <div className='flex flex-col justify-center items-center bg-white p-4'>
              <h3 className='text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl text-center text-gray-500'>First post coming soon</h3>
            </div>
        }
      </div>
    </Container>
  )
}

export const getStaticProps: GetStaticProps = async (): Promise<any> => {
  const connection = await dbConnection('post');
  const postRepository = connection.getRepository(Post);
  const posts = await postRepository.createQueryBuilder("post")
    .where("post.isPublished = true")
    .orderBy("post.createdAt", "DESC")
    .getMany();
  await connection.close();
  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts))
    },
    revalidate: 60,
  };
}
