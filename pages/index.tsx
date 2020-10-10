import { GetServerSideProps } from 'next'
import { signIn, signOut, useSession } from 'next-auth/client'
import Nav from '../components/nav'
import axios from 'axios';
import { Post } from '../models';

export default function IndexPage(props: any) {
  const [session, loading] = useSession()
  const posts: Post[] = props.posts;
  return (
    <div>
      <Nav />
      {!session && <>
        Not signed in <br />
        <button onClick={signIn as any}>Sign in</button>
      </>}
      {session && <>
        Signed in as {session.user.name} <br />
        <button onClick={signOut as any}>Sign out</button>
      </>}

      {
        posts.map((p, i) =>
          <div key={i}>
            <h2>{p.title}</h2>
            <p>{p.subtitle}</p>
          </div>
        )
      }
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (): Promise<any> => {
  const response = await axios.get(`${process.env.NEXTAUTH_URL}/api/post`);
  const posts = response.data ? response.data : [];
  return {
    props: {
      posts
    }
  };
}
