import { GetStaticProps } from 'next'
import Container from '../components/container'
import axios from 'axios';
import { MailProviders, MailSettings, Post, Publication } from '../models';
import { useState } from 'react';
import Link from 'next/link';
import { emailRegex } from '../constants/emailRegex';
import { dbConnection } from '../repository';
import { useRouter } from 'next/router';
import Head from 'next/head';
import IssueCard from '../components/issueCard';

export default function Index(props: {
  publication: Publication,
  mailActive: boolean,
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const publication: Publication | undefined = props.publication;
  return (
    <Container publicationName={publication ? publication.name : ''}>
      <Head>
        <title>{publication?.name}</title>
        <meta charSet="UTF-8" />
        <meta name="description" content={publication?.description} />

        <meta name="twitter:card" content="summary" />
        {/* <meta name="twitter:site" content="" />
        <meta name="twitter:creator" content="" />
        TODO: Add values */}
        <meta name="twitter:title" content={publication?.name} />
        <meta name="twitter:description" content={publication?.description} />
        <meta name="twitter:image" content={publication?.imageUrl ? publication?.imageUrl : require('../public/assets/banner.svg')} />

        <meta property="og:title" content={publication?.name} />
        <meta property="og:site_name" content={publication?.name} />
        <meta property="og:description" content={publication?.description} />
        <meta property="og:image" content={publication?.imageUrl ? publication?.imageUrl : require('../public/assets/banner.svg')} />
        <meta property="og:url" content={process.env.SITE_URL} />
        <meta property="og:type" content="blog" />
      </Head>
      <div className='flex flex-col justify-center items-center px-1 min-h-full'>
        {
          publication ?
            <>
              <h1 className='text-center mb-2'>{publication.name}</h1>
              <h2 className='text-center mb-8 max-w-5xl'>{publication.description}</h2>
              <img src={publication.imageUrl ? publication.imageUrl : require('../public/assets/banner.svg')} className='cover-image' alt={`${publication.name} cover image`} />
              {
                props.mailActive &&
                <div className='adjusted-width mb-8'>
                  <form method='POST' onSubmit={(evt) => {
                    evt.preventDefault();
                    if (email && emailRegex.test(email) && !name) {
                      setLoading(true);
                      axios.post('/api/member/subscribe', {
                        email,
                        publicationId: publication.id
                      })
                        .then(response => {
                          setEmail('');
                          setLoading(false);
                          setErrorMessage('');
                          router.push('/thanks-for-subscribing');
                        })
                        .catch(error => {
                          setLoading(false);
                          if (error.response.data) {
                            setErrorMessage(error.response.data);
                          } else {
                            setErrorMessage('An error occurred while subscribing.');
                          }
                        });
                    } else {
                      setErrorMessage('Email is not valid.');
                    }
                  }}>
                    <label htmlFor='sweet' className='sweet'>Please fill in this field</label>
                    <input name='sweet-field' className='sweet' placeholder='Sweet and sticky field' id='sweet' autoComplete='off' value={name}
                      type='sticky-field' onChange={(evt) => setName(evt.currentTarget.value)} />
                    <div className='flex shadow-2xl'>
                      <label htmlFor='member-email' className='sweet'>Enter your email</label>
                      <input id='member-email' name='email' type='email' placeholder='Enter your email' autoFocus onChange={(evt) => setEmail(evt.currentTarget.value)}
                        value={email} className='input-subscribe' />
                      <button className='button-subscribe'
                        type='submit' disabled={loading}>
                        <span className={loading ? 'opacity-30' : ''} style={{ paddingTop: '0.125rem' }}>Subscribe</span>
                        {
                          loading &&
                          <div className='absolute'>
                            <svg className="animate-spin h-6 w-6 m-1 rounded-full border-2"
                              style={{ borderColor: 'white white black black' }} viewBox="0 0 24 24"></svg>
                          </div>
                        }
                      </button>
                    </div>
                    {
                      errorMessage &&
                      <label className='text-red-500 mt-4 ml-2'>
                        <strong>{errorMessage}</strong>
                      </label>
                    }
                  </form>
                </div>
              }
              <hr className='my-8 border-t-2 border-black w-2/12' />
              <div className='flex flex-col justify-center items-center my-4 w-full'>
                {
                  (publication.posts || []).map((p, i) => <IssueCard post={p} key={i} />)
                }
              </div>
              <hr className='my-8 border-t-2 border-black w-2/12' />
              {
                publication.posts && publication.posts.length > 0 &&
                <div className='flex flex-col justify-center items-center mb-16 mt-8 w-full'>
                  <Link href='/archive'>
                    <a className='btn-default'>Archive</a>
                  </Link>
                </div>
              }
            </>
            :
            <>
              <h1 className='header-2xl text-center mb-10'>This site is still under construction</h1>
              <img className='img-2xl' src={require('../public/assets/underconstruction.svg')} alt='under construction' />
            </>
        }

      </div>
    </Container>
  )
}

export const getStaticProps: GetStaticProps = async (): Promise<any> => {
  const connection = await dbConnection('publication');
  const publicationRepository = connection.getRepository(Publication);
  let publication = await publicationRepository.findOne();

  const mailSettingsRepository = connection.getRepository(MailSettings);
  const mailSettings = await mailSettingsRepository.findOne();
  if (!publication) {
    await connection.close();
    return {
      props: {},
      revalidate: 300,
    };
  } else {
    const postRepository = connection.getRepository(Post);
    const post = await postRepository.createQueryBuilder("post").where("post.isPublished = true").orderBy("post.createdAt", "DESC").getOne();
    await connection.close();
    publication.posts = post ? [post] : [];

    return {
      props: {
        mailActive: mailSettings && mailSettings.provider !== MailProviders.NONE ? true : false,
        publication: JSON.parse(JSON.stringify(publication))
      },
      revalidate: 300,
    }
  }
}
