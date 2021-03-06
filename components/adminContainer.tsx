import React from 'react';
import { signIn, signOut, useSession } from 'next-auth/client';
import Link from 'next/link';
import Unauthorized from './unauthorized';
import SpinnerButton from './spinnerButton';
import Head from 'next/head';
import { FaviconUtils } from '../utils/favicon';

export default function AdminPageContainer(props: {
  publicationName?: string,
  publicationImageUrl?: string,
  children: React.ReactNode,
}) {
  const [session, loading] = useSession();
  return (
    <div className='flex flex-col justify-between w-full'>
      <Head>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Martel:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
        {
          props.publicationImageUrl &&
          FaviconUtils.getFaviconLink(props.publicationImageUrl)
        }
      </Head>
      <nav className='flex justify-between w-full p-2 items-center border-b-2 border-gray-300 shadow-md'>
        {
          !session && !loading &&
          <SpinnerButton
            loading={false}
            disabled={false}
            type='button'
            text='Sign in'
            onClick={signIn as any} />
        }
        {
          session && !loading &&
          <>
            <ul className='m-0 p-0 list-none'>
              <li className='nav-item nav-item-border inline-block mr-2'>
                <Link href="/dashboard">
                  <a className='btn-nav'>Dashboard</a>
                </Link>
              </li>
              <li className='nav-item nav-item-border inline-block mr-2'>
                <Link href='/members'>
                  <a className='btn-nav text-gray-700 hover:text-black hover:bg-gray-300'>Members</a>
                </Link>
              </li>
              <li className='nav-item nav-item-border inline-block'>
                <Link href='/mail-settings'>
                  <a className='btn-nav'>Mail settings</a>
                </Link>
              </li>
            </ul>
            <div className='inline-flex'>
              <ul className='flex flex-wrap text-sm md:text-base list-none'>
                <li className="relative group rounded-lg">
                  {
                    session.user.image ?
                      <img className='h-12 w-12 rounded-full' src={session.user.image} alt='profile pic' />
                      :
                      <svg className='w-12 h-12' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                  }
                  <ul className="absolute right-0 top-0 mt-12 p-2 rounded-lg shadow-lg hidden bg-white z-10 group-hover:block list-none">
                    <li className='nav-item nav-item-border'>
                      <button className='btn-nav' onClick={signOut as any}>Sign out</button>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </>
        }
      </nav>
      <main>
        {
          loading &&
          <div className='full-page'>
            <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-black"></span>
          </div>
        }
        {
          !loading && !session ?
            <Unauthorized />
            :
            props.children
        }
      </main>
    </div>
  );
}
