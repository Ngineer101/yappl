import { GetStaticPaths, GetStaticProps } from "next"
import { Post, Publication } from "../../models";
import { dbConnection } from "../../repository";
import Head from 'next/head';
import Container from '../../components/container';
import moment from 'moment';

export default function PostPage(props: any) {
  const post: Post | undefined = props.post;
  return (
    <Container>
      <div className='flex flex-col justify-center items-center p-4 w-full'>
        <Head>
          <title>{post?.title}</title>
          <meta charSet='UTF-8' />
          <meta name='description' content={post?.subtitle} />

          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content={post?.title} />
          <meta name="twitter:description" content={post?.subtitle} />
          {/* <meta name="twitter:image" content={} /> TODO: Add twitter image when post has cover image */}

          <meta property="og:title" content={post?.title} />
          <meta property="og:site_name" content={props.publicationName} />
          <meta property="og:description" content={post?.subtitle} />
          {/* <meta property="og:image" content={} /> TODO: Add facebook image when post has cover image */}
          <meta property="og:url" content={process.env.SITE_URL} />
          <meta property="og:type" content="blog" />
        </Head>
        <div className='flex flex-col justify-center items-center adjusted-width'>
          {
            post ?
              <>
                <h1 className='post-title'>{post.title}</h1>
                <h2 className='post-subtitle'>{post.subtitle}</h2>
                <div className='w-full flex items-center'>
                  <div className='mr-3'>
                    <img className='h-10 w-10 rounded-full' src={post.authorImage} alt='author image' />
                  </div>
                  <div className='flex flex-col'>
                    <label>{post.authorName}</label>
                    <small>
                      {
                        post.publishedAt ?
                          moment(post.publishedAt).format('ll') :
                          moment(post.createdAt).format('ll')
                      }
                    </small>
                  </div>
                </div>
                <hr className='w-full' />
                <div className='w-full post-container' dangerouslySetInnerHTML={{ __html: post.htmlContent }}></div>
              </>
              :
              <div></div>
          }
        </div>
      </div>
    </Container>
  )
}

export const getStaticPaths: GetStaticPaths = async (): Promise<any> => {
  const connection = await dbConnection('posts');
  const postRepository = connection.getRepository(Post);
  const posts = await postRepository.find();
  const paths = posts.map(p => { return { params: { slug: p.slug } } });
  return {
    paths,
    fallback: true,
  };
}

export const getStaticProps: GetStaticProps = async (context: any): Promise<any> => {
  const { slug } = context.params;
  const connection = await dbConnection('post');
  const postRepository = connection.getRepository(Post);
  const post = await postRepository.findOne({ slug: slug });

  const publicationRepository = connection.getRepository(Publication);
  const publication = await publicationRepository.findOne();
  await connection.close();
  if (post) {
    return {
      props: {
        publicationName: publication ? publication.name : '',
        post: JSON.parse(JSON.stringify(post))
      },
      revalidate: 300,
    };
  } else {
    return {
      notFound: true,
      revalidate: 300,
    }
  }
}
