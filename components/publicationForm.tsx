import {
  Dispatch,
  FormEvent,
  SetStateAction
} from "react";

export default function PublicationForm(props: {
  name: string,
  setName: Dispatch<SetStateAction<string>>,
  description: string,
  setDescription: Dispatch<SetStateAction<string>>,
  imageUrl: string | undefined,
  setImageUrl: Dispatch<SetStateAction<string | undefined>>,
  errorMessage: string,
  loading: boolean,
  savePublication: (evt: FormEvent<HTMLFormElement>) => void,
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

      {/* TODO: add functionality to upload image */}
      <div className='my-4'>
        <label htmlFor='imageUrl'>Cover image URL</label>
        <input className='input-default' type='text' name='imageUrl' value={props.imageUrl} placeholder='This image will be displayed on the home page'
          onChange={(evt) => props.setImageUrl(evt.currentTarget.value)} />
      </div>

      <button className='flex justify-center btn-default mt-4' type='submit' disabled={props.loading}>
        {
          props.loading &&
          <svg className="animate-spin h-5 w-5 m-1 rounded-full border-2" style={{ borderColor: 'white white black black' }} viewBox="0 0 24 24"></svg>
        }
        {
          !props.loading &&
          <span>Save</span>
        }
      </button>

      {
        props.errorMessage &&
        <label className='text-red-500 mt-4 ml-2'>
          <strong>{props.errorMessage}</strong>
        </label>
      }
    </form>
  )
}
