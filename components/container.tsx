import { signIn, signOut, useSession } from "next-auth/client";

export default function PageContainer(props: any) {
  const [session, loading] = useSession()
  return (
    <div className='flex flex-col justify-between w-full'>
      {
        !props.hideNav &&
        <nav className='flex justify-end w-full p-2'>
          <>
            {
              !session &&
              <button className='btn-default' onClick={signIn as any}>Sign in</button>
            }
            {
              session &&
              <>
                <button className='btn-default' onClick={signOut as any}>Sign out</button>
              </>
            }
          </>

        </nav>
      }
      <main>
        {props.children}
      </main>
      {
        props.publicationName &&
        <footer className='p-2 bg-black text-white flex justify-center'>
          <label>Copyright {props.publicationName} &#169;</label>
        </footer>
      }
    </div>
  );
}