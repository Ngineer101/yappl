import { useRouter } from "next/router";
import axios from 'axios';
import { FormEvent, useState } from "react";

export default function ImportPublication() {
  const router = useRouter()
  const [rssFeedUrl, setRssFeedUrl] = useState('');
  const { userId } = router.query
  return (
    <div>
      {userId}
      <form onSubmit={
        (evt) => {
          if (rssFeedUrl)
            submitForm(evt, rssFeedUrl, 'substack', userId as string);
        }
      }>
        <label htmlFor='rssFeedUrl'>RSS Feed Url</label>
        <input type="text" name='rssFeedUrl' value={rssFeedUrl} onChange={(evt) => setRssFeedUrl(evt.currentTarget.value)} />

        <button type='submit'>Import</button>
      </form>
    </div>
  );
}

const submitForm = (evt: FormEvent<HTMLFormElement>, rssFeedUrl: string, source: string, userId: string) => {
  evt.preventDefault();
  axios.post('/api/publication/import', {
    userId,
    rssFeedUrl,
    source
  })
    .then(response => {
      window.location.href = `${window.location.origin}/publication/${response.data}`;
    })
    .catch(error => {
      console.log(error.response.data)
      // TODO: Handle error
    });
}
