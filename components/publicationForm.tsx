import {
  Dispatch,
  FormEvent,
  SetStateAction
} from "react";
import ImageUpload from "./imageUpload";
import SpinnerButton from "./spinnerButton";

export default function PublicationForm(props: {
  name: string,
  setName: Dispatch<SetStateAction<string>>,
  description: string,
  setDescription: Dispatch<SetStateAction<string>>,
  imageUrl: string | undefined,
  setImageUrl: Dispatch<SetStateAction<string | undefined>>,
  errorMessage: string,
  setErrorMessage?: Dispatch<SetStateAction<string>>,
  loading: boolean,
  savePublication: (evt: FormEvent<HTMLFormElement>) => void,
  imageUploadEnabled?: boolean,
}) {
  return (
    <form onSubmit={props.savePublication}>
      <div className='my-4'>
        <label htmlFor='name'>Publication name</label>
        <input className='input-default' type='text' name='name' value={props.name} placeholder='Publication name'
          onChange={(evt) => props.setName(evt.currentTarget.value)} />
      </div>

      <div className='my-4'>
        <label htmlFor='description'>About</label>
        <textarea className='input-default' name='description' value={props.description} placeholder='What is your publication about?'
          onChange={(evt) => props.setDescription(evt.currentTarget.value)}></textarea>
      </div>

      {
        props.imageUploadEnabled ?
          <div className='my-4'>
            <label>Cover image</label>
            <ImageUpload
              imageUrl={props.imageUrl}
              setImageUrl={props.setImageUrl}
              subPath='publication_info/cover_image'
              setErrorMessage={props.setErrorMessage}
            />
          </div>
          :
          <div className='my-4'>
            <label htmlFor='imageUrl'>Cover image URL</label>
            <input className='input-default' type='text' name='imageUrl' value={props.imageUrl} placeholder='This image will be displayed on the home page'
              onChange={(evt) => props.setImageUrl(evt.currentTarget.value)} />
          </div>
      }

      <SpinnerButton
        text='Save'
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
  )
}
