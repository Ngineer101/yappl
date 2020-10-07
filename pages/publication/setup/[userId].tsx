import Link from 'next/link';
import { useRouter } from 'next/router';

export default function SetupPublication() {
  const router = useRouter()
  const { userId } = router.query
  return (
    <div>
      <Link href={`/publication/import/${userId}`}>
        <a>Import</a>
      </Link>

      <Link href={`/publication/new/${userId}`}>
        <a>Create new publication</a>
      </Link>
    </div>
  )
}
