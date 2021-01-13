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
    axios.post(`/api/upload?subPath=${props.subPath}`, formData, {
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
    <div className='relative'>
      {
        loading &&
        <div className='w-full h-full absolute flex justify-center items-center bg-black'>
          <svg className="animate-spin h-10 w-10 m-1 rounded-full border-2" style={{ borderColor: 'white white black black' }} viewBox="0 0 24 24"></svg>
        </div>
      }
      <div {...getRootProps()} className={`${isDragActive ? 'bg-gray-500' : 'bg-gray-300'} cursor-pointer px-4 py-12 flex justify-center items-center border-dotted border-4 border-black outline-none`}
        style={{
          backgroundImage: props.imageUrl ? `url(${props.imageUrl})` : undefined,
          backgroundSize: 'cover',
        }}>
        <input {...getInputProps()} />
        {
          isDragActive ?
            <span className={`${isDragActive ? 'bg-gray-500' : 'bg-gray-300'} rounded-lg p-4`}>Drop image</span> :
            <span className={`${isDragActive ? 'bg-gray-500' : 'bg-gray-300'} rounded-lg p-4`}>Drag and drop image here</span>
        }
      </div>
    </div>
  )
}
