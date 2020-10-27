import { GetServerSideProps } from "next"
import axios from 'axios';
import { Post } from "../../models";

export default function PostPage(props: any) {
  const post: Post | undefined = props.post;
  return (
    <div className='flex flex-col justify-center items-center p-4'>
      <div className='flex flex-col justify-center items-center adjusted-width'>
        {
          post ?
            <>
              <h1>{post.title}</h1>
              <h2>{post.subtitle}</h2>
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
  return axios.get(`${process.env.NEXTAUTH_URL}/api/post/by-slug?slug=${slug}`)
    .then(response => {
      const post = response.data ? response.data : null;
      return {
        props: {
          post
        }
      };
    })
    .catch(error => {
      // TODO: Handle error
      console.error(error);
      return {
        props: {}
      }
    });
}
