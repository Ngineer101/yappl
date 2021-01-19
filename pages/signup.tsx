import { useState } from "react"
import axios from 'axios';
import Container from '../components/container';
import { csrfToken } from "next-auth/client";
import { useRouter } from "next/router";
import UserForm from "../components/userForm";

export default function SignUp(props: any) {
  const [image, setImage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  return (
    <Container>
      <div className='full-page'>
        <div className='form-adjusted-width card-col mt-24'>
          <img className='my-4 image-banner' src={require('../public/assets/welcome.svg')} alt='welcome banner' />
          <h2 className='text-center'>Sign up to create your publication</h2>
          <UserForm onSubmit={
            (evt) => {
              evt.preventDefault();
              if (email && password && password === passwordConfirmation) {
                setLoading(true);
                setErrorMessage('');
                axios.post('/api/user/signup', {
                  email,
                  password,
                  name,
                  image,
                })
                  .then(response => {
                    setErrorMessage('');
                    const userId = response.data;
                    axios.post('/api/auth/callback/credentials', {
                      csrfToken: props.csrfToken,
                      email,
                      password
                    })
                      .then(response => {
                        router.push(`/publication/setup/${userId}`);
                      })
                      .catch(error => {
                        setLoading(false);
                        if (error.response.data) {
                          setErrorMessage(error.response.data);
                        } else {
                          setErrorMessage('An error occurred while signing up');
                        }
                      })
                  })
                  .catch(error => {
                    setLoading(false);
                    if (error.response.data) {
                      setErrorMessage(error.response.data);
                    } else {
                      setErrorMessage('An error occurred while signing up');
                    }
                  });
              }
            }
          }
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            imageUrl={image}
            setImageUrl={setImage}
            password={password}
            setPassword={setPassword}
            passwordConfirmation={passwordConfirmation}
            setPasswordConfirmation={setPasswordConfirmation}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            loading={loading}
            imageUploadEnabled={props.imageUploadEnabled} />
        </div>
      </div>
    </Container>
  )
}

SignUp.getInitialProps = async (context: any) => {
  // TODO: Only render this page if no users exist
  return {
    imageUploadEnabled: process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET ? true : false,
    csrfToken: await csrfToken(context)
  }
}
