import Container from '../components/container';

export default function NotFound() {
  return (
    <Container>
      <div className='flex flex-col justify-center items-center p-1'>
        <h1 className='header-2xl text-center mb-10'>Page not found</h1>
        <img className='img-2xl' src={require('../public/assets/notfound.svg')} />
      </div>
    </Container>
  );
}
