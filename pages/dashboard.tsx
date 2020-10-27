import { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/client';
import Container from '../components/container';
import { Post, Publication } from '../models';
import { dbConnection } from '../repository';

export default function Dashboard(props: any) {
  const [session, loading] = useSession();
  const publications: Publication[] = props.publications ? props.publications : [];
  return (
    <Container>
      {
        !session &&
        <>No authenticated</> // TODO: Create unauthorized component
      }
      {
        session &&
        <div className='flex flex-col justify-center items-center px-1'>
          <div className='adjusted-width'>
            {
              publications.map(publication =>
                <div key={publication.id}>
                  <h1 className='text-center'>{publication.name}</h1>
                  <h3 className='text-center'>{publication.description}</h3>
                  <hr />
                  <div className='flex flex-row justify-between'>
                    <h3>Posts</h3>
                    <div className='flex flex-col justify-center items-center'>
                      <a href={`/api/publication/new-post?publicationId=${publication.id}`}
                        className='btn-default flex justify-center items-center'>
                        <svg className='w-6 h-6 mr-2' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>New post</span>
                      </a>
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
                              </div>
                              {
                                post.source === 'scribeapp' &&
                                <div className='flex flex-col justify-center items-center'>
                                  <a className="bg-white hover:bg-gray-300 text-black p-2 rounded inline-flex items-center" href={`/publication/${publication.id}/post/${post.id}`}>
                                    <svg className='w-6 h-6' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </a>
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
          </div>
        </div>
      }
    </Container>
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
