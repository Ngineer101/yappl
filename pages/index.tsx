import { GetServerSideProps } from 'next'
import Container from '../components/container'
import axios from 'axios';
import { Post, Publication } from '../models';
import { useState } from 'react';
import Link from 'next/link';
import { emailRegex } from '../constants/emailRegex';
import { dbConnection } from '../repository';

export default function IndexPage(props: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const publication: Publication | undefined = props.publication;
  return (
    <Container publicationName={publication ? publication.name : ''}>
      <div className='flex flex-col justify-center items-center px-1'>
        {
          publication ?
            <>
              <h1 className='text-center mb-2'>{publication.name}</h1>
              <h2 className='text-center mb-10'>{publication.description}</h2>
              <img src={require('../public/assets/banner.svg')} className='h-64 max-w-full' />
              <div className='max-w-2xl w-11/12 bg-cover bg-center mb-8 p-4'>
                <form method='POST' onSubmit={(evt) => {
                  evt.preventDefault();
                  if (email && emailRegex.test(email)) {
                    setLoading(true);
                    axios.post('/api/member/subscribe', {
                      email,
                      publicationId: publication.id
                    })
                      .then(response => {
                        setEmail('');
                        setLoading(false);
                        setSuccessMessage('Thanks for subscribing! Please check your inbox for a verification email.');
                        setErrorMessage('');
                      })
                      .catch(error => {
                        setLoading(false);
                        setErrorMessage('An error occurred while subscribing.');
                        setSuccessMessage('');
                      });
                  } else {
                    setErrorMessage('Email is not valid.');
                    setSuccessMessage('');
                  }
                }}>
                  <div className='relative shadow-2xl border border-black'>
                    <input type='email' placeholder='Enter your email to subscribe' autoFocus onChange={(evt) => setEmail(evt.currentTarget.value)}
                      value={email} className='text-sm sm:text-sm md:text-xl lg:text-xl xl:text-xl form-input block w-full p-3' />
                    <button className='text-sm sm:text-sm md:text-xl lg:text-xl xl:text-xl absolute inset-y-0 right-0 flex items-center bg-black text-white px-4 hover:bg-gray-800'
                      type='submit' disabled={loading}>
                      {
                        loading &&
                        <svg className="animate-spin h-5 w-5 m-3 rounded-full border-2" style={{ borderColor: 'white white black black' }} viewBox="0 0 24 24"></svg>
                      }
                      {
                        !loading &&
                        <span>Subscribe</span>
                      }
                    </button>
                  </div>
                  {
                    successMessage &&
                    <label className='text-green-500 mt-4 ml-2'>
                      <strong>{successMessage}</strong>
                    </label>
                  }
                  {
                    errorMessage &&
                    <label className='text-red-500 mt-4 ml-2'>
                      <strong>{errorMessage}</strong>
                    </label>
                  }
                </form>
              </div>
              <div className='flex flex-col justify-center items-center my-8 adjusted-width'>
                {
                  (publication.posts || []).map((p, i) =>
                    <div key={i} className='flex flex-col justify-center items-center -mt-4 bg-white p-4 border border-black shadow-2xl'>
                      <h3 className='text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl text-center'>{p.title}</h3>
                      <p className='text-base sm:text-base md:text-lg lg:text-lg xl:text-lg text-center text-gray-600'>{p.subtitle}</p>
                      <Link href={`/p/${p.slug}`}>
                        <a className='mt-8 text-blue-500 text-base sm:text-base md:text-xl lg:text-xl xl:text-xl text-center'>Read the latest issue</a>
                      </Link>
                    </div>
                  )
                }
              </div>
              <div className='my-8'>
                <Link href='/issues'>
                  <a className='btn-default'>Past Issues</a>
                </Link>
              </div>
            </>
            :
            <>
              <h1 className='text-3xl sm:text-3xl md:text-5xl lg:text-5xl xl:text-5xl text-center mb-10'>This site is still under construction</h1>
              <img className='w-11/12 sm:w-11/12 md:w-1/2 lg:w-1/2 xl:w-1/2' src={require('../public/assets/underconstruction.svg')} />
            </>
        }

      </div>
    </Container>
  )
}

export const getServerSideProps: GetServerSideProps = async (): Promise<any> => {
  const connection = await dbConnection('publication');
  const publicationRepository = connection.getRepository(Publication);
  let publication = await publicationRepository.findOne();

  if (!publication) {
    await connection.close();
    return {
      props: {}
    };
  } else {
    const postRepository = connection.getRepository(Post);
    const post = await postRepository.createQueryBuilder("post").where("post.isPublished = true").orderBy("post.createdAt", "DESC").getOne();
    await connection.close();
    publication.posts = post ? [post] : [];

    return {
      props: {
        publication: JSON.parse(JSON.stringify(publication))
      }
    }
  }
}
