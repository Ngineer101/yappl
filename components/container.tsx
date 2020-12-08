import React from 'react';

export default function PageContainer(props: {
  publicationName?: string,
  children: React.ReactNode,
}) {
  return (
    <div className='flex flex-col justify-between w-full'>
      <main>
        {
          props.children
        }
      </main>
      {
        props.publicationName &&
        <footer className='p-2 bg-black text-white flex flex-col items-center justify-center'>
          <label>&#169; {new Date().getFullYear().toString()} - {props.publicationName}</label>
          <small>Powered by <a className='text-white underline' target='_blank' href={`https://yappl.xyz?referrer=${props.publicationName}`}>
            <strong>Yappl</strong>
          </a>
          </small>
        </footer>
      }
    </div>
  );
}