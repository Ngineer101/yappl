import React, { useState } from 'react';
import { csrfToken } from 'next-auth/client';
import Container from '../../components/container';
import { useRouter } from 'next/router';

export default function SignIn(props: any) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { error, firstSignIn } = router.query;
  return (
    <Container>
      <div className='flex justify-center items-center'>
        <div className='flex flex-col form-adjusted-width shadow-2xl p-4'>
          <img className='my-4 image-banner' src={require('../../public/assets/welcome.svg')} />

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
              <label htmlFor='username'>Username</label>
              <input className='input-default' name='username' type='text' placeholder='Username' />
            </div>

            <div className='my-4'>
              <label htmlFor='password'>Password</label>
              <input className='input-default' name='password' type='password' placeholder='Password' />
            </div>

            <button className='flex justify-center btn-default mt-4' type='submit' disabled={loading}>
              {
                loading &&
                <svg className="animate-spin h-5 w-5 m-1 rounded-full border-2" style={{ borderColor: 'white white black black' }} viewBox="0 0 24 24"></svg>
              }
              {
                !loading &&
                <span>Sign in</span>
              }
            </button>

            {
              error &&
              <>
                <label className='text-red-500 mt-4 ml-2'>
                  <strong>
                    {
                      error === 'CredentialsSignin' ?
                        <>Username or password is incorrect</> :
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
