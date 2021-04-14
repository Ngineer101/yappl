import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";
import { useState } from "react";
import AdminPageContainer from "../components/adminContainer";
import UserForm from "../components/userForm";
import { User } from "../models";
import { dbConnection } from "../repository";

export default function Profile(props: {
  user: User | undefined,
  imageUploadEnabled: boolean,
}) {
  const [image, setImage] = useState(props.user?.image);
  const [name, setName] = useState(props.user?.name);
  const [email, setEmail] = useState(props.user?.email);
  const [password, setPassword] = useState<string | undefined>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string | undefined>('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  return (
    <AdminPageContainer>
      <div className='full-page'>
        <div className='form-adjusted-width card-col mt-24'>
          <h2 className='text-center'>Update your profile</h2>
          <UserForm onSubmit={(evt) => { }}
            name={name || ''}
            setName={setName}
            email={email || ''}
            setEmail={setEmail}
            imageUrl={image || ''}
            setImageUrl={setImage}
            password={password}
            setPassword={setPassword}
            passwordConfirmation={passwordConfirmation}
            setPasswordConfirmation={setPasswordConfirmation}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            loading={loading}
            imageUploadEnabled={props.imageUploadEnabled}
          />
        </div>
      </div>
    </AdminPageContainer>
  );
}

export const getServerSideProps: GetServerSideProps = async (context): Promise<any> => {
  const session = await getSession(context);
  if (!session) {
    return {
      props: {}
    };
  }

  const connection = await dbConnection('user');
  const userRepository = connection.getRepository(User);
  const user = await userRepository.findOne({ email: session.user.email || '' });
  await connection.close();

  const imageUploadEnabled = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET ? true : false;
  if (user) {
    user.passwordHash = undefined;
    return {
      props: {
        imageUploadEnabled,
        user: JSON.parse(JSON.stringify(user)),
      }
    };
  } else {
    return {
      props: {
        imageUploadEnabled,
      }
    };
  }
}
