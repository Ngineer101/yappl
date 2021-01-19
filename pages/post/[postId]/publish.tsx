import Head from "next/head";
import { useState } from "react";
import AdminPageContainer from "../../../components/adminContainer";
import SpinnerButton from "../../../components/spinnerButton";
import axios from 'axios';
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import ImageUpload from "../../../components/imageUpload";

export default function PublishPost(props: {
  imageUploadEnabled: boolean,
}) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sendEmailToMembers, setSendEmailToMembers] = useState(false);
  const [tileImageUrl, setTileImageUrl] = useState('');
  const router = useRouter();
  const { postId } = router.query;
  return (
    <AdminPageContainer>
      <Head>
        <title>Publish post</title>
      </Head>
      <div className='full-page'>
        <div className='form-adjusted-width card-col mt-24'>
          <img className='my-4 image-banner' src={require('../../../public/assets/post.svg')} alt='publish post' />
          <h2 className='text-center'>Publish post</h2>
          <form onSubmit={
            (evt) => {
              evt.preventDefault();
              setLoading(true);
              setErrorMessage('');
              axios.post(`/api/publication/publish-post?postId=${postId}`, {
                tileImageUrl,
                sendEmailToMembers,
              })
                .then(response => {
                  if (response.data) {
                    router.replace(response.data.canonicalUrl);
                  }
                })
                .catch(error => {
                  setLoading(false);
                  if (error.response.data) {
                    setErrorMessage(error.response.data);
                  } else {
                    setErrorMessage('An error occurred while publishing this post.');
                  }
                });
            }
          }>
            {
              props.imageUploadEnabled ?
                <div className='my-4'>
                  <label htmlFor='tileImageUrl'>Cover image</label>
                  <div className='mb-2 h-28 rounded-lg overflow-hidden'>
                    <ImageUpload
                      imageUrl={tileImageUrl}
                      setImageUrl={setTileImageUrl as any}
                      label='Drag and drop image here'
                      subPath={`posts/${postId}/cover_image`} />
                  </div>
                </div>
                :
                <div className='my-4'>
                  <label htmlFor='tileImageUrl'>Cover image URL</label>
                  <input className='input-default' name='tileImageUrl' type='text' value={tileImageUrl}
                    onChange={(evt) => setTileImageUrl(evt.currentTarget.value)} />
                </div>
            }
            <div className='my-4'>
              <label htmlFor='sendEmailToMembers' className='flex cursor-pointer'
                onClick={() => {
                  if (sendEmailToMembers) {
                    setSendEmailToMembers(false);
                  } else {
                    setSendEmailToMembers(true);
                  }
                }}>
                <input className='h-5 w-5 mr-4 checked:bg-blue-600 checked:border-transparent'
                  name='sendEmailToMembers'
                  type='checkbox'
                  checked={sendEmailToMembers} />
                Send email to subscribers
                </label>
            </div>

            <SpinnerButton
              text='Publish'
              type='submit'
              loading={loading}
              disabled={loading}
              className='mt-4' />

            {
              errorMessage &&
              <label className='text-red-500 mt-4 ml-2'>
                <strong>{errorMessage}</strong>
              </label>
            }
          </form>
        </div>
      </div>
    </AdminPageContainer>
  );
}

export const getServerSideProps: GetServerSideProps = (context): any => {
  return {
    props: {
      imageUploadEnabled: process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET ? true : false,
    }
  };
}
