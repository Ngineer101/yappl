import axios from 'axios';
import AdminContainer from '../components/adminContainer';
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function ImportMembers() {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { setup } = router.query;
  const onDrop = useCallback(acceptedFiles => {
    setLoading(true);
    // TODO: Validate file format
    var formData = new FormData();
    formData.append('members', acceptedFiles[0]);
    axios.post('/api/publication/import-members', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        setLoading(false)
        setErrorMessage('');
        setSuccessMessage(response.data);
        if (router.asPath.indexOf("setup=true") > -1) {
          router.push('/dashboard')
        } else {
          router.push('/members');
        }
      })
      .catch(error => {
        setLoading(false);
        setSuccessMessage('');
        if (error.response.data) {
          setErrorMessage(error.response.data);
        } else {
          setErrorMessage('An error occurred while importing members');
        }
      })
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({ onDrop, maxFiles: 1, maxSize: 20000000 });

  return (
    <AdminContainer>
      <div className='full-page'>
        <div className='form-adjusted-width card-col mt-24'>
          <img className='my-4 image-banner' src={require('../public/assets/post.svg')} alt='post' />
          <h2 className='text-center'>Import members using a CSV file</h2>
          <div className='my-4 relative'>
            {
              loading &&
              <div className='w-full h-full absolute flex justify-center items-center bg-black'>
                <svg className="animate-spin h-10 w-10 m-1 rounded-full border-2" style={{ borderColor: 'white white black black' }} viewBox="0 0 24 24"></svg>
              </div>
            }
            <div {...getRootProps()} className={`${isDragActive ? 'bg-gray-500' : 'bg-gray-300'} cursor-pointer px-4 py-12 flex justify-center items-center border-dotted border-4 border-black outline-none`}>
              <input {...getInputProps()} />
              {
                isDragActive ?
                  <>Drop file</> :
                  <>Drag and drop CSV file here</>
              }
            </div>

            <div className='text-center mt-4'>
              {
                setup === "true" &&
                <Link href="/dashboard">
                  <a>
                    <strong>Skip this step</strong>
                  </a>
                </Link>
              }
              {
                setup !== "true" &&
                <Link href='/members'>
                  <a>
                    <strong>Cancel</strong>
                  </a>
                </Link>
              }
            </div>
          </div>
          {
            successMessage &&
            <label className='text-green-500 mt-4 ml-2'>
              <strong>{successMessage}</strong>
            </label>
          }
          {
            errorMessage &&
            <label className='text-red-500 mt-4 ml-2'>
              <strong>{errorMessage}</strong>
            </label>
          }
        </div>
      </div>
    </AdminContainer>
  );
}
