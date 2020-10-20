import { useRouter } from "next/router";
import axios from 'axios';
import { useState } from "react";
import Container from '../../../components/container';
import { urlRegex } from '../../../constants/urlRegex'

export default function ImportPublication() {
  const router = useRouter()
  const [rssFeedUrl, setRssFeedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { userId } = router.query
  return (
    <Container hideButton>
      <div className='flex justify-center items-center'>
        <div className='flex flex-col form-adjusted-width shadow-2xl p-4'>
          <img className='my-4 image-banner' src={require('../../../public/assets/post.svg')} />
          <h2 className='text-center'>Import existing publication</h2>
          <form onSubmit={
            (evt) => {
              evt.preventDefault();
              if (rssFeedUrl && urlRegex.test(rssFeedUrl)) {
                setLoading(true);
                setErrorMessage('');
                axios.post('/api/publication/import', {
                  userId,
                  rssFeedUrl,
                  source: 'rss'
                })
                  .then(response => {
                    setErrorMessage('');
                    window.location.href = `${window.location.origin}/publication/${response.data}`;
                  })
                  .catch(error => {
                    setLoading(false);
                    if (error.response.data) {
                      setErrorMessage(error.response.data);
                    } else {
                      setErrorMessage('An error occurred while importing the publication');
                    }
                  });
              } else {
                setErrorMessage('URL is not valid');
              }
            }
          }>

            <div className='my-4'>
              <label htmlFor='rssFeedUrl'>RSS Feed URL</label>
              <input className='input-default' type="text" name='rssFeedUrl' placeholder='RSS Feed URL'
                value={rssFeedUrl} onChange={(evt) => setRssFeedUrl(evt.currentTarget.value)} />
            </div>

            <button className='flex justify-center btn-default mt-4' type='submit' disabled={loading}>
              {
                loading &&
                <svg className="animate-spin h-5 w-5 m-1 rounded-full border-2" style={{ borderColor: 'white white black black' }} viewBox="0 0 24 24"></svg>
              }
              {
                !loading &&
                <span>Import</span>
              }
            </button>

            {
              errorMessage &&
              <label className='text-red-500 mt-4 ml-2'>
                <strong>{errorMessage}</strong>
              </label>
            }
          </form>
        </div>
      </div>
    </Container>
  );
}
