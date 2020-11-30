import { GetServerSideProps } from "next"
import { Post } from "../../models";
import { dbConnection } from "../../repository";
import Head from 'next/head';

export const config = { amp: 'hybrid' }

export default function PostPage(props: any) {
  const post: Post | undefined = props.post;
  return (
    <div className='flex flex-col justify-center items-center p-4 w-full'>
      {/* TODO: Add SEO data here */}
      <Head>
        <title>{post?.title}</title>
      </Head>
      <div className='flex flex-col justify-center items-center adjusted-width'>
        {
          post ?
            <>
              <h1 className='text-center'>{post.title}</h1>
              <h2 className='text-center'>{post.subtitle}</h2>
              <hr className='w-full' />
              {
                post.source === 'rss' &&
                <div className='w-full rss-post-container' dangerouslySetInnerHTML={{ __html: post.htmlContent }}></div>
              }
              {
                post.source === 'scribeapp' &&
                <div className='w-full rss-post-container' dangerouslySetInnerHTML={{ __html: post.htmlContent }}></div>
              }
              <hr className='w-full' />
              <div className='w-full flex items-center'>
                <div className='mr-3'>
                  <img className='h-12 w-12 rounded-full' src={post.authorImage} />
                </div>
                <span>- {post.authorName}</span>
              </div>
            </>
            :
            <div></div>
        }
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context: any): Promise<any> => {
  const { slug } = context.params;
  const connection = await dbConnection('post');
  const postRepository = connection.getRepository(Post);
  const post = await postRepository.findOne({ slug: slug });
  await connection.close();
  if (post) {
    return {
      props: {
        post: JSON.parse(JSON.stringify(post))
      }
    };
  } else {
    return {
      props: {}
    }
  }
}
