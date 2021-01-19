import {
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
} from "react"
import { useDropzone } from "react-dropzone";
import axios from 'axios';

const allowedImageTypes = [
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/webp",
];

export default function ImageUpload(props: {
  imageUrl: string | undefined,
  setImageUrl: Dispatch<SetStateAction<string | undefined>>,
  subPath?: string,
  setErrorMessage?: Dispatch<SetStateAction<string>>,
  label?: string,
}) {
  const [loading, setLoading] = useState(false);
  const onDrop = useCallback(images => {
    setLoading(true);
    const imageType = images[0].type;
    if (allowedImageTypes.indexOf(imageType) === -1) {
      if (props.setErrorMessage)
        props.setErrorMessage('Image format is not allowed. Allowed formats are PNG, JPG, JPEG, GIF, SVG and WebP.');

      setLoading(false);
      return;
    }

    var formData = new FormData();
    formData.append('image', images[0]);
    axios.post(`/api/upload?subPath=${props.subPath}/${images[0].name}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        setLoading(false)
        props.setImageUrl(response.data?.link);
        if (props.setErrorMessage)
          props.setErrorMessage('');
      })
      .catch(error => {
        setLoading(false);
        props.setImageUrl('');
        if (props.setErrorMessage) {
          if (error.response.data) {
            props.setErrorMessage(error.response.data);
          } else {
            props.setErrorMessage('An error occurred while uploading the image.');
          }
        }
      })
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({ onDrop, maxFiles: 1, maxSize: 20000000 });

  return (
    <div className='relative h-full w-full'>
      {
        loading &&
        <div className='w-full h-full absolute flex justify-center items-center bg-black'>
          <svg className="animate-spin h-10 w-10 m-1 rounded-full border-2" style={{ borderColor: 'white white black black' }} viewBox="0 0 24 24"></svg>
        </div>
      }
      <div {...getRootProps()} className={`${isDragActive ? 'bg-gray-500' : 'bg-gray-300'} cursor-pointer flex flex-col justify-center items-center outline-none h-full w-full`}
        style={{
          backgroundImage: props.imageUrl ? `url(${props.imageUrl})` : undefined,
          backgroundSize: 'cover',
        }}>
        <input {...getInputProps()} />
        <span className={`${isDragActive ? 'bg-gray-500' : 'bg-gray-300'} bg-gray-100 rounded-lg`}>
          <svg className='w-6 h-6' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </span>
        {
          props.label && !props.imageUrl &&
          <span className={`${isDragActive ? 'bg-gray-500' : 'bg-gray-300'} rounded-lg px-4 pb-4 pt-2`}>{props.label}</span>
        }
      </div>
    </div>
  )
}
