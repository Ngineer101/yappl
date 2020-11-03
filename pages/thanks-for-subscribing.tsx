import Container from '../components/container';

export default function ThanksForSubscribing() {
  return (
    <Container hideNav>
      <div className='flex flex-col justify-center items-center p-1'>
        <h1 className='text-center'>
          Thanks for subscribing!
        </h1>
        <h2 className='text-center mb-10'>
          Please check your inbox for a verification email.
        </h2>
        {/* TODO: Add twitter share button */}
        <img className='img-2xl' src={require('../public/assets/success.svg')} />
      </div>
    </Container>
  )
}
