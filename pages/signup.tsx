import { useState } from "react"
import axios from 'axios';
import Container from '../components/container';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <Container>
      <div className='flex justify-center items-center'>
        <div className='flex flex-col form-adjusted-width shadow-2xl p-4'>
          <img className='my-4 image-banner' src={require('../public/assets/welcome.svg')} />
          <h2 className='text-center'>Sign up to create your publication</h2>
          <form onSubmit={
            (evt) => {
              evt.preventDefault();
              if (username && password && password === passwordConfirmation) {
                setLoading(true);
                setErrorMessage('');
                axios.post('/api/user/signup', {
                  username,
                  password,
                })
                  .then(response => {
                    setErrorMessage('');
                    window.location.href = `${window.location.origin}/publication/setup/${response.data}`;
                  })
                  .catch(error => {
                    setLoading(false);
                    if (error.response.data) {
                      setErrorMessage(error.response.data);
                    } else {
                      setErrorMessage('An error occurred while signing up');
                    }
                  });
              }
            }
          }>
            <div className='my-4'>
              <label htmlFor='username'>Username</label>
              <input className='input-default' name='username' type='text' value={username} placeholder='Username'
                onChange={(evt) => setUsername(evt.currentTarget.value)} />
            </div>

            <div className='my-4'>
              <label htmlFor='password'>Password</label>
              <input className='input-default' name='password' type='password' autoComplete='new-password' placeholder='Password'
                value={password} onChange={(evt) => setPassword(evt.currentTarget.value)} />
            </div>

            <div className='my-4'>
              <label htmlFor='passwordConfirmation'>Confirm password</label>
              <input className='input-default' name='passwordConfirmation' type='password' autoComplete='new-password' placeholder='Confirm password'
                value={passwordConfirmation} onChange={(evt) => setPasswordConfirmation(evt.currentTarget.value)} />
            </div>

            <button className='flex justify-center btn-default mt-4' type='submit' disabled={loading}>
              {
                loading &&
                <svg className="animate-spin h-5 w-5 m-1 rounded-full border-2" style={{ borderColor: 'white white black black' }} viewBox="0 0 24 24"></svg>
              }
              {
                !loading &&
                <span>Sign up</span>
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
  )
}
