import { useRouter } from "next/router"
import { FormEvent, useState } from "react"
import axios from 'axios';
import Container from '../../../components/container';
import PublicationForm from '../../../components/publicationForm';

export default function NewPublication() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter()
  const { userId } = router.query
  return (
    <Container hideNav>
      <div className='full-page'>
        <div className='form-adjusted-width card-col'>
          <img className='my-4 image-banner' src={require('../../../public/assets/post.svg')} />
          <h2 className='text-center'>Create new publication</h2>
          <PublicationForm
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            errorMessage={errorMessage}
            loading={loading}
            savePublication={(evt) => {
              evt.preventDefault();
              if (name && description) {
                setLoading(true);
                setErrorMessage('');
                axios.post('/api/publication/new', {
                  userId,
                  name,
                  description
                }, { withCredentials: true })
                  .then(response => {
                    setErrorMessage('');
                    window.location.href = `${window.location.origin}/publication/${response.data}/import-members`;
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
    </Container>
  )
}
