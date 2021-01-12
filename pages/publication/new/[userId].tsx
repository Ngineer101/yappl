import { useRouter } from "next/router"
import { FormEvent, useState } from "react"
import axios from 'axios';
import AdminContainer from '../../../components/adminContainer';
import PublicationForm from '../../../components/publicationForm';
import { GetServerSideProps } from "next";

export default function NewPublication(props: {
  imageUploadEnabled: boolean,
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter()
  const { userId } = router.query
  return (
    <AdminContainer>
      <div className='full-page'>
        <div className='form-adjusted-width card-col mt-24'>
          <img className='my-4 image-banner' src={require('../../../public/assets/post.svg')} alt='post' />
          <h2 className='text-center'>Create new publication</h2>
          <PublicationForm
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl as any} // :(
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            loading={loading}
            imageUploadEnabled={props.imageUploadEnabled}
            savePublication={(evt) => {
              evt.preventDefault();
              if (name && description) {
                setLoading(true);
                setErrorMessage('');
                axios.post('/api/publication/new', {
                  userId,
                  name,
                  description,
                  imageUrl,
                }, { withCredentials: true })
                  .then(() => {
                    setErrorMessage('');
                    router.push(`/mail-settings?setup=true`);
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
    </AdminContainer>
  )
}

export const getServerSideProps: GetServerSideProps = (context): any => {
  return {
    props: {
      imageUploadEnabled: process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET ? true : false,
    }
  };
}
