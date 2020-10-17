import { GetServerSideProps } from "next";
import Link from 'next/link';
import axios from 'axios';
import Container from '../components/container';
import { Post } from "../models";

export default function Issues(props: any) {
  const posts: Post[] = props.posts || [];
  return (
    <Container>
      <div className='flex flex-col justify-center items-center px-1'>
        <h1 className='text-3xl sm:text-3xl md:text-5xl lg:text-5xl xl:text-5xl text-center mb-2 mt-8'>Past Issues</h1>
        {
          posts.length > 0 ?
            posts.map((p, i) =>
              <div key={i} className='flex flex-col justify-center items-center bg-white p-4 border border-black shadow-2xl my-4 adjusted-width'>
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

export const getServerSideProps: GetServerSideProps = async (): Promise<any> => {
  return axios.get(`${process.env.NEXTAUTH_URL}/api/post`)
    .then(response => {
      const posts = response.data ? response.data : [];
      return {
        props: {
          posts
        }
      };
    })
    .catch(error => {
      return {
        props: {}
      };
    })
}
