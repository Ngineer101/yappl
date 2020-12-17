import React from 'react';
import Head from 'next/head';

export default function PageContainer(props: {
  publicationName?: string,
  children: React.ReactNode,
}) {
  return (
    <div className='flex flex-col justify-between w-full'>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, user-scalable=0" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Martel:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <main>
        {
          props.children
        }
      </main>
      {
        props.publicationName &&
        <footer className='p-2 bg-black text-white flex flex-col items-center justify-center'>
          <label>&#169; {new Date().getFullYear().toString()} - {props.publicationName}</label>
          <small>Powered by <a className='text-white underline' target='_blank' href={`https://yappl.xyz?referrer=${props.publicationName}`} rel='noopener noreferrer'>
            <strong>Yappl</strong>
          </a>
          </small>
        </footer>
      }
    </div>
  );
}