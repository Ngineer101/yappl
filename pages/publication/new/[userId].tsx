import { useRouter } from "next/router"
import { FormEvent, useState } from "react"
import axios from 'axios';
import Container from '../../../components/container';

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
          <form onSubmit={
            (evt) => {
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
            }
          }>

            <div className='my-4'>
              <label htmlFor='name'>Publication name</label>
              <input className='input-default' type='text' name='name' value={name} placeholder='Publication name'
                onChange={(evt) => setName(evt.currentTarget.value)} />
            </div>

            <div className='my-4'>
              <label htmlFor='description'>About</label>
              <textarea className='input-default' name='description' value={description} placeholder='What is your publication about?'
                onChange={(evt) => setDescription(evt.currentTarget.value)}></textarea>
            </div>

            <button className='flex justify-center btn-default mt-4' type='submit' disabled={loading}>
              {
                loading &&
                <svg className="animate-spin h-5 w-5 m-1 rounded-full border-2" style={{ borderColor: 'white white black black' }} viewBox="0 0 24 24"></svg>
              }
              {
                !loading &&
                <span>Create</span>
              }
            </button>
            {/* TODO: Add error handling */}
          </form>
        </div>
      </div>
    </Container>
  )
}
