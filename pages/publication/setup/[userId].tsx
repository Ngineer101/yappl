import Link from 'next/link';
import { useRouter } from 'next/router';
import Container from '../../../components/container';

export default function SetupPublication() {
  const router = useRouter()
  const { userId } = router.query
  return (
    <Container hideNav protected>
      <div className='full-page'>
        <div className='form-adjusted-width card-col'>
          <img className='my-4 image-banner' src={require('../../../public/assets/post.svg')} />
          <h2 className='text-center'>Set up your publication</h2>

          <div className='flex flex-row justify-center items-center'>
            <Link href={`/publication/import/${userId}`}>
              <a className='btn-square'>Import existing publication using RSS feed</a>
            </Link>

            <Link href={`/publication/new/${userId}`}>
              <a className='btn-square'>Create new publication</a>
            </Link>
          </div>
        </div>
      </div>
    </Container>
  )
}
