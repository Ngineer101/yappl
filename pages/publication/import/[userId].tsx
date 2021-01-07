import { useRouter } from "next/router";
import axios from 'axios';
import { useState } from "react";
import AdminContainer from '../../../components/adminContainer';
import { urlRegex } from '../../../constants/urlRegex'
import SpinnerButton from "../../../components/spinnerButton";

export default function ImportPublication() {
  const router = useRouter()
  const [rssFeedUrl, setRssFeedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { userId } = router.query
  return (
    <AdminContainer>
      <div className='full-page'>
        <div className='form-adjusted-width card-col mt-24'>
          <img className='my-4 image-banner' src={require('../../../public/assets/post.svg')} alt='post' />
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

            <SpinnerButton
              text='Import'
              type='submit'
              loading={loading}
              disabled={loading}
              className='mt-4' />

            {
              errorMessage &&
              <label className='text-red-500 mt-4 ml-2'>
                <strong>{errorMessage}</strong>
              </label>
            }
          </form>
        </div>
      </div>
    </AdminContainer>
  );
}
