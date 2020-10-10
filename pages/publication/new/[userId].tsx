import { useRouter } from "next/router"
import { FormEvent, useState } from "react"
import axios from 'axios';

export default function NewPublication() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter()
  const { userId } = router.query
  return (
    <div>
      {userId}
      <form onSubmit={
        (evt) => {
          if (name && description)
            submitForm(evt, name, description, userId as string);
        }
      }>
        <label htmlFor='name'>Newsletter name</label>
        <input type='text' name='name' value={name} onChange={(evt) => setName(evt.currentTarget.value)} />

        <label htmlFor='description'>Description</label>
        <textarea name='description' value={description} onChange={(evt) => setDescription(evt.currentTarget.value)}></textarea>

        <button type='submit'>Submit</button>
      </form>
    </div>
  )
}

const submitForm = (evt: FormEvent<HTMLFormElement>, name: string, description: string, userId: string) => {
  evt.preventDefault();
  axios.post('/api/publication/new', {
    userId,
    name,
    description
  })
    .then(response => {
      window.location.href = `${window.location.origin}/publication/${response.data}`;
    })
    .catch(error => {
      console.log(error.response.data)
      // TODO: Handle error
    });
}
