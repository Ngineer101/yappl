import React from 'react'
import { providers, signIn } from 'next-auth/client'

export default function SignIn(props: any) {
  const providers: any[] = props.providers;
  return (
    <div>
      {
        Object.values(providers).map(provider => (
          <div key={provider.name} >
            <button onClick={() => signIn(provider.id)} > Sign in with {provider.name} </button>
          </div>
        ))
      }
    </div>
  )
}

SignIn.getInitialProps = async () => {
  return {
    providers: await providers()
  }
}
