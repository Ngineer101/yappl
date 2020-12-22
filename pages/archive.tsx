import { GetStaticProps } from "next";
import Container from '../components/container';
import { Post, Publication } from "../models";
import { dbConnection } from "../repository";
import Head from 'next/head';
import IssueCard from "../components/issueCard";

export default function Archive(props: any) {
  const posts: Post[] = props.posts || [];
  const publication: Publication | undefined = props.publication;
  return (
    <Container>
      <Head>
        <title>Archive</title>
        <meta charSet="UTF-8" />
        <meta name="description" content={publication?.description} />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={publication?.name} />
        <meta name="twitter:description" content={publication?.description} />
        <meta name="twitter:image" content={publication?.imageUrl ? publication?.imageUrl : require('../public/assets/banner.svg')} />

        <meta property="og:title" content={publication?.name} />
        <meta property="og:site_name" content={publication?.name} />
        <meta property="og:description" content={publication?.description} />
        <meta property="og:image" content={publication?.imageUrl ? publication?.imageUrl : require('../public/assets/banner.svg')} />
        <meta property="og:url" content={process.env.SITE_URL} />
        <meta property="og:type" content="blog" />
      </Head>
      <div className='flex flex-col justify-center items-center px-1'>
        <h1 className='text-3xl sm:text-3xl md:text-5xl lg:text-5xl xl:text-5xl text-center mb-2 mt-8'>Archive</h1>
        {
          posts.length > 0 ?
            posts.map((p, i) => <IssueCard post={p} key={i} />)
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
  const publicationRepository = connection.getRepository(Publication);
  const publication = await publicationRepository.findOne();

  const postRepository = connection.getRepository(Post);
  const posts = await postRepository.createQueryBuilder("post")
    .where("post.isPublished = true")
    .orderBy("post.createdAt", "DESC")
    .getMany();
  await connection.close();
  return {
    props: {
      publication: JSON.parse(JSON.stringify(publication)),
      posts: JSON.parse(JSON.stringify(posts))
    },
    revalidate: 300,
  };
}
