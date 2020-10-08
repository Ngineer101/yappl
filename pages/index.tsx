import { signIn, signOut, useSession } from 'next-auth/client'
import Nav from '../components/nav'

export default function IndexPage() {
  const [session, loading] = useSession()
  return (
    <div>
      <Nav />
      {!session && <>
        Not signed in <br />
        <button onClick={signIn as any}>Sign in</button>
      </>}
      {session && <>
        Signed in as {session.user.name} <br />
        <button onClick={signOut as any}>Sign out</button>
      </>}
    </div>
  )
}
