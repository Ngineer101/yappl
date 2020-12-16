import React, { useState } from 'react';
import { csrfToken } from 'next-auth/client';
import Container from '../../components/container';
import { useRouter } from 'next/router';
import SpinnerButton from '../../components/spinnerButton';

export default function SignIn(props: any) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { error, firstSignIn } = router.query;
  return (
    <Container>
      <div className='flex justify-center items-center'>
        <div className='card-col form-adjusted-width mt-24'>
          <img className='my-4 image-banner' src={require('../../public/assets/welcome.svg')} alt='welcome banner' />

          {
            firstSignIn &&
            <>
              <h3 className='text-center mb-0'>Publication set up successfully!</h3>
              <h3 className='text-center'>Sign in to get started</h3>
            </>
          }
          <form method='post' action='/api/auth/callback/credentials' onSubmit={() => setLoading(true)}>
            <input name='csrfToken' type='hidden' defaultValue={props.csrfToken} />

            <div className='my-4'>
              <label htmlFor='email'>Email</label>
              <input className='input-default' name='email' type='text' placeholder='Email' />
            </div>

            <div className='my-4'>
              <label htmlFor='password'>Password</label>
              <input className='input-default' name='password' type='password' placeholder='Password' />
            </div>

            <SpinnerButton
              loading={loading}
              disabled={loading}
              type='submit'
              text='Sign in'
              className='mt-4' />

            {
              error &&
              <>
                <label className='text-red-500 mt-4 ml-2'>
                  <strong>
                    {
                      error === 'CredentialsSignin' ?
                        <>Email or password is incorrect</> :
                        <>An error occurred while signing in</>
                    }
                  </strong>
                </label>
              </>
            }
          </form>
        </div>
      </div>
    </Container>
  )
}

SignIn.getInitialProps = async (context: any) => {
  return {
    csrfToken: await csrfToken(context)
  }
}
