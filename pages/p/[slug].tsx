import { GetServerSideProps } from "next"
import { Post } from "../../models";
import { dbConnection } from "../../repository";

export default function PostPage(props: any) {
  const post: Post | undefined = props.post;
  return (
    <div className='flex flex-col justify-center items-center p-4'>
      <div className='flex flex-col justify-center items-center adjusted-width'>
        {
          post ?
            <>
              <h1 className='text-center'>{post.title}</h1>
              <h2 className='text-center'>{post.subtitle}</h2>
              {
                post.source === 'rss' &&
                <div className='w-full rss-post-container' dangerouslySetInnerHTML={{ __html: post.htmlContent }}></div>
              }
              {
                post.source === 'scribeapp' &&
                <></>
              }
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
