import Container from '../components/container';
import Head from 'next/head';

export default function EmailVerified() {
  return (
    <Container hideNav>
      <Head>
        <title>Thanks for verifying your email.</title>
      </Head>
      <div className='full-page'>
        <div className='flex flex-col justify-center items-center p-1'>
          <h1 className='header-2xl text-center mb-10'>Thanks for verifying your email.</h1>
          <img className='img-2xl' src={require('../public/assets/success.svg')} />
        </div>
      </div>
    </Container>
  );
}
