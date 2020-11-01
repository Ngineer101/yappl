import React from 'react';
import { signIn, signOut, useSession } from "next-auth/client";
import Link from "next/link";
import Unauthorized from './unauthorized';

export default function PageContainer(props: {
  publicationName?: string,
  hideNav?: boolean,
  protected?: boolean,
  children: React.ReactNode,
}) {
  const [session, loading] = useSession()
  return (
    <div className='flex flex-col justify-between w-full'>
      {
        !props.hideNav &&
        <nav className='flex justify-end w-full p-2'>
          <>
            {
              !session &&
              <button className='btn-default' onClick={signIn as any}>Sign in</button>
            }
            {
              session &&
              <>
                <Link href="/dashboard">
                  <a className='btn-default'>Dashboard</a>
                </Link>
                <button className='btn-default ml-2' onClick={signOut as any}>Sign out</button>
              </>
            }
          </>

        </nav>
      }
      <main>
        {
          props.protected && !session ?
            <Unauthorized />
            :
            props.children
        }
      </main>
      {
        props.publicationName &&
        <footer className='p-2 bg-black text-white flex justify-center'>
          <label>Copyright {props.publicationName} &#169;</label>
        </footer>
      }
    </div>
  );
}