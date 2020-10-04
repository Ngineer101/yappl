import '../styles/index.css'
import '../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Provider } from 'next-auth/client';

function MyApp({ Component, pageProps }) {
  return (
    <Provider session={pageProps.session}>
      <Component {...pageProps} />
    </Provider>
  )
}

export default MyApp
