import {
  Dispatch,
  FormEvent,
  SetStateAction,
} from "react";
import ImageUpload from "./imageUpload";
import SpinnerButton from "./spinnerButton";

export default function UserForm(props: {
  name: string,
  setName: Dispatch<SetStateAction<string>>,
  email: string,
  setEmail: Dispatch<SetStateAction<string>>,
  imageUrl: string,
  setImageUrl: Dispatch<SetStateAction<string>>,
  password: string,
  setPassword: Dispatch<SetStateAction<string>>,
  passwordConfirmation: string,
  setPasswordConfirmation: Dispatch<SetStateAction<string>>,
  errorMessage: string,
  setErrorMessage?: Dispatch<SetStateAction<string>>,
  loading: boolean,
  imageUploadEnabled?: boolean,
  onSubmit: (evt: FormEvent<HTMLFormElement>) => void,
}) {
  return (
    <form onSubmit={props.onSubmit}>

      {
        props.imageUploadEnabled ?
          <div className='w-full flex justify-center items-center flex-col my-4'>
            <div className='w-32 h-32 rounded-full overflow-hidden'>
              <ImageUpload
                imageUrl={props.imageUrl}
                setImageUrl={props.setImageUrl as any}
                subPath='profile_pictures'
                label='Picture' />
            </div>
          </div>
          :
          <div className='my-4'>
            <label htmlFor='image'>Gravatar URL</label>
            <input className='input-default' name='image' type='text' value={props.imageUrl} placeholder='Gravatar URL'
              onChange={(evt) => props.setImageUrl(evt.currentTarget.value)} />
          </div>
      }

      <div className='my-4'>
        <label htmlFor='name'>Name</label>
        <input className='input-default' name='name' type='text' value={props.name} placeholder='Name'
          onChange={(evt) => props.setName(evt.currentTarget.value)} />
      </div>

      <div className='my-4'>
        <label htmlFor='email'>Email</label>
        <input className='input-default' name='email' type='text' value={props.email} placeholder='Email'
          onChange={(evt) => props.setEmail(evt.currentTarget.value)} />
      </div>

      <div className='my-4'>
        <label htmlFor='password'>Password</label>
        <input className='input-default' name='password' type='password' autoComplete='new-password' placeholder='Password'
          value={props.password} onChange={(evt) => props.setPassword(evt.currentTarget.value)} />
      </div>

      <div className='my-4'>
        <label htmlFor='passwordConfirmation'>Confirm password</label>
        <input className='input-default' name='passwordConfirmation' type='password' autoComplete='new-password' placeholder='Confirm password'
          value={props.passwordConfirmation} onChange={(evt) => props.setPasswordConfirmation(evt.currentTarget.value)} />
      </div>

      <SpinnerButton
        text='Sign up'
        type='submit'
        loading={props.loading}
        disabled={props.loading}
        className='mt-4' />

      {
        props.errorMessage &&
        <label className='text-red-500 mt-4 ml-2'>
          <strong>{props.errorMessage}</strong>
        </label>
      }

    </form>
  );
}
