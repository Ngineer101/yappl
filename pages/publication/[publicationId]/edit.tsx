import { GetServerSideProps } from "next";
import { Publication } from "../../../models";
import Container from '../../../components/container';
import { getSession, useSession } from "next-auth/client";
import { useState } from "react";
import PublicationForm from "../../../components/publicationForm";
import axios from 'axios';
import { dbConnection } from "../../../repository";
import { useRouter } from "next/router";

export default function EditPublicationPage(props: any) {
  const publication: Publication = props.publication ? props.publication : null;
  const [session, sessionLoading] = useSession();
  const [name, setName] = useState(publication ? publication.name : '');
  const [description, setDescription] = useState(publication ? publication.description : '');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  return (
    <Container protected>
      {
        session &&
        <div className='full-page'>
          <div className='form-adjusted-width card-col mt-24'>
            <img className='my-4 image-banner' src={require('../../../public/assets/post.svg')} />
            <h2 className='text-center'>Update publication</h2>
            <PublicationForm
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              errorMessage={errorMessage}
              loading={loading}
              savePublication={
                (evt) => {
                  evt.preventDefault();
                  if (name && description) {
                    setLoading(true);
                    setErrorMessage('');
                    axios.post(`/api/publication/update?publicationId=${publication.id}`, {
                      name,
                      description
                    }, { withCredentials: true })
                      .then(response => {
                        setErrorMessage('');
                        router.push('/dashboard');
                      })
                      .catch(error => {
                        setLoading(false);
                        if (error.response.data) {
                          setErrorMessage(error.response.data);
                        } else {
                          setErrorMessage('An error occurred while creating the publication');
                        }
                      });
                  }
                }} />
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

  const { publicationId } = context.params;
  const connection = await dbConnection('publication');
  const publicationRepository = connection.getRepository(Publication);
  const publication = await publicationRepository.findOne({ id: publicationId });
  await connection.close();

  if (publication) {
    return {
      props: {
        publication: JSON.parse(JSON.stringify(publication))
      }
    };
  } else {
    return {
      props: {}
    }
  }
}
