import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/client';
import AdminContainer from '../components/adminContainer';
import { Post, Publication } from '../models';
import { dbConnection } from '../repository';
import Head from 'next/head';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useState } from 'react';
import SpinnerButton from '../components/spinnerButton';
import moment from 'moment';
import Link from 'next/link';

export default function Dashboard(props: any) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState(''); // TODO: Display error message somewhere
  const [loadingNewPost, setLoading] = useState(false);
  const publications: Publication[] = props.publications ? props.publications : [];
  return (
    <AdminContainer>
      <Head>
        <title>Dashboard</title>
      </Head>
      <div className='flex flex-col justify-center items-center px-1'>
        <div className='adjusted-width'>
          {
            publications.map(publication =>
              <div key={publication.id}>
                <div className='relative'>
                  <Link href={`/publication/${publication.id}/edit`}>
                    <a className="absolute right-0 top-0 -mt-2 bg-gray-100 hover:bg-gray-300 text-black p-2 rounded inline-flex items-center">
                      <svg className='w-6 h-6' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </a>
                  </Link>
                  <h1 className='text-center'>{publication.name}</h1>
                  <h3 className='text-center'>{publication.description}</h3>
                </div>
                <hr />
                <div className='flex flex-row justify-between'>
                  <h3>Posts</h3>
                  <div className='flex flex-col justify-center items-center'>

                    <SpinnerButton
                      loading={loadingNewPost}
                      disabled={loadingNewPost}
                      type='button'
                      text={'New post'}
                      onClick={(evt) => {
                        setLoading(true);
                        axios.get(`/api/publication/new-post?publicationId=${publication.id}`,
                          { withCredentials: true })
                          .then(response => {
                            router.push(`/publication/${publication.id}/post/${response.data}`);
                          })
                          .catch(error => {
                            setLoading(false);
                            if (error.response.data) {
                              setErrorMessage(error.response.data);
                            } else {
                              setErrorMessage('An error occurred while creating a new post.');
                            }
                          })
                      }} />

                  </div>
                </div>
                <hr />
                {
                  publication.posts && publication.posts.length > 0 &&
                  <>
                    {
                      (publication.posts || []).map(post =>
                        <div key={post.id} className='card-col my-4'>
                          <div className='flex flex-row justify-between'>
                            <div className='flex flex-col justify-center'>
                              {
                                post.title ?
                                  <h5 className='mt-1'>{post.title}</h5>
                                  :
                                  <label>Untitled post</label>
                              }
                              {
                                post.subtitle &&
                                <label>{post.subtitle}</label>
                              }
                              {
                                post.isPublished ?
                                  <small className='mt-2'>Published {moment(post.publishedAt).format('ll')}</small> :
                                  <small className='mt-2'>Edited {moment(post.updatedAt).format('ll')}</small>
                              }
                            </div>
                            {
                              post.source === 'yappl' &&
                              <div className='flex flex-col justify-center items-center'>
                                <Link href={`/post/${post.id}`}>
                                  <a className="bg-white hover:bg-gray-300 text-black p-2 rounded inline-flex items-center">
                                    <svg className='w-6 h-6' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </a>
                                </Link>
                              </div>
                            }
                          </div>
                        </div>
                      )
                    }
                  </>
                }
              </div>
            )
          }
          {
            // TODO: Show message and create publication button if no publication exists
          }
        </div>
      </div>
    </AdminContainer>
  )
}

export const getServerSideProps: GetServerSideProps = async (context: any): Promise<any> => {
  const session = await getSession(context);
  if (!session) {
    return {
      props: {}
    }
  }

  const connection = await dbConnection('publication');
  const publicationRepository = connection.getRepository(Publication);
  const publications = await publicationRepository.find();
  const postRepository = connection.getRepository(Post);
  for (var i = 0; i < publications.length; i++) {
    const publicationId = publications[i].id;
    publications[i].posts = await postRepository.createQueryBuilder("post")
      .where("post.publicationId = :publicationId", { publicationId: publicationId })
      .orderBy("post.createdAt", "DESC").getMany();
  }

  await connection.close();
  return {
    props: {
      publications: JSON.parse(JSON.stringify(publications))
    }
  }
}
