import { FormEvent, useState } from "react"
import axios from 'axios';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  return (
    <div>
      <form onSubmit={
        (evt) => {
          if (password === passwordConfirmation)
            submitForm(evt, username, password)
        }
      }>
        <label htmlFor='username'>Username</label>
        <input name='username' type='text' value={username} onChange={(evt) => setUsername(evt.currentTarget.value)} />

        <label htmlFor='password'>Password</label>
        <input name='password' type='password' autoComplete='new-password'
          value={password} onChange={(evt) => setPassword(evt.currentTarget.value)} />

        <label htmlFor='passwordConfirmation'>Confirm password</label>
        <input name='passwordConfirmation' type='password' autoComplete='new-password'
          value={passwordConfirmation} onChange={(evt) => setPasswordConfirmation(evt.currentTarget.value)} />

        <button type='submit'>Sign up</button>
      </form>
    </div>
  )
}

const submitForm = (evt: FormEvent<HTMLFormElement>, username: string, password: string) => {
  evt.preventDefault();
  axios.post('/api/user/signup', {
    username,
    password,
  })
    .then(response => {
      if (response.status > 199 && response.status < 300) {
        window.location.href = `${window.location.origin}/publication/setup/${response.data}`;
      } else {
        // TODO: Handle error
      }
    })
    .catch(error => {
      // TODO: Handle error
    });
}
