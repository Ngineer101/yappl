import Container from '../components/container';

function Error({ statusCode }) {
  return (
    <Container>
      <div className='flex flex-col justify-center items-center p-1'>
        <h1 className='header-2xl text-center mb-10'>An error occurred - please refresh the page</h1>
        <img className='img-2xl' src={require('../public/assets/servererror.svg')} />
      </div>
    </Container>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
