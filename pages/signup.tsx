import { useState } from "react"
import axios from 'axios';
import Container from '../components/container';
import { csrfToken } from "next-auth/client";

export default function SignUp(props: any) {
  const [image, setImage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <Container>
      <div className='full-page'>
        <div className='form-adjusted-width card-col mt-24'>
          <img className='my-4 image-banner' src={require('../public/assets/welcome.svg')} />
          <h2 className='text-center'>Sign up to create your publication</h2>
          <form onSubmit={
            (evt) => {
              evt.preventDefault();
              if (email && password && password === passwordConfirmation) {
                setLoading(true);
                setErrorMessage('');
                axios.post('/api/user/signup', {
                  email,
                  password,
                  name,
                  image,
                })
                  .then(response => {
                    setErrorMessage('');
                    const userId = response.data;
                    axios.post('/api/auth/callback/credentials', {
                      csrfToken: props.csrfToken,
                      email,
                      password
                    })
                      .then(response => {
                        window.location.href = `${window.location.origin}/publication/setup/${userId}`;
                      })
                      .catch(error => {
                        setLoading(false);
                        if (error.response.data) {
                          setErrorMessage(error.response.data);
                        } else {
                          setErrorMessage('An error occurred while signing up');
                        }
                      })
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
              <label>Name</label>
              <input className='input-default' name='name' type='text' value={name} placeholder='Name'
                onChange={(evt) => setName(evt.currentTarget.value)} />
            </div>

            <div className='my-4'>
              <label htmlFor='email'>Email</label>
              <input className='input-default' name='email' type='text' value={email} placeholder='Email'
                onChange={(evt) => setEmail(evt.currentTarget.value)} />
            </div>

            {/* TODO: add functionality to upload image */}
            <div className='my-4'>
              <label htmlFor='image'>Gravatar URL</label>
              <input className='input-default' name='image' type='text' value={image} placeholder='Gravatar URL'
                onChange={(evt) => setImage(evt.currentTarget.value)} />
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

SignUp.getInitialProps = async (context: any) => {
  // TODO: Only render this page if no users exist
  return {
    csrfToken: await csrfToken(context)
  }
}
