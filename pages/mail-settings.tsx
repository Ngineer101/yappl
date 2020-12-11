import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import { useState } from "react";
import AdminPageContainer from "../components/adminContainer";
import { MailProviders, Publication } from "../models";
import { dbConnection } from "../repository";
import SpinnerButton from '../components/spinnerButton';
import axios from 'axios';
import { useRouter } from "next/router";
import { CryptoUtils } from '../utils/crypto';

export default function MailSettings(props: any) {
  const publication: Publication = props.publications ? props.publications[0] : null; // There should only be one publication anyway
  const [mailProvider, setMailProvider] = useState(publication.mailSettings ? publication.mailSettings.provider : MailProviders.NONE);
  const [mailgunApiKey, setMailgunApiKey] = useState(publication.mailSettings ? publication.mailSettings.mailgunApiKey : '');
  const [mailgunDomain, setMailgunDomain] = useState(publication.mailSettings ? publication.mailSettings.mailgunDomain : '');
  const [mailgunHost, setMailgunHost] = useState(publication.mailSettings ? publication.mailSettings.mailgunHost : '');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <AdminPageContainer>
      <div className='flex justify-center items-center full-page'>
        <div className='form-adjusted-width card-col mt-24'>
          <img className='my-4 image-banner' src={require('../public/assets/mail.svg')} />
          <h2 className='text-center'>{publication.name} mail settings</h2>
          <form onSubmit={(evt) => {
            evt.preventDefault();
            if (mailProvider !== MailProviders.NONE && (!mailgunApiKey || !mailgunDomain)) {
              setErrorMessage('Mailgun API key and domain is required.');
              return;
            }

            setLoading(true);
            axios.post(`/api/publication/update-mail-settings?publicationId=${publication.id}`, {
              mailProvider,
              mailgunApiKey,
              mailgunDomain,
              mailgunHost,
            })
              .then(response => {
                router.push('/dashboard');
              })
              .catch(error => {
                setLoading(false);
                if (error.response.data) {
                  setErrorMessage(error.response.data);
                } else {
                  setErrorMessage('An error occurred while saving the mail settings.');
                }
              });
          }}>
            <div className='my-4'>
              <label htmlFor='mailProvider'>Mail provider</label>
              <select className='input-default' name='mailProvider' value={mailProvider} onChange={(evt) => setMailProvider(evt.currentTarget.value as MailProviders)}>
                <option value={MailProviders.NONE}>None</option>
                <option value={MailProviders.MAILGUN}>Mailgun</option>
              </select>
            </div>
            {
              mailProvider === MailProviders.MAILGUN &&
              <>
                <div className='my-4'>
                  <label htmlFor='mailgunApiKey'>Mailgun API key</label>
                  {/* TODO: change input to password type */}
                  <input className='input-default' type='text' name='mailgunApiKey' value={mailgunApiKey} placeholder='Mailgun API key (e.g. key-1ds434a8b56...)'
                    onChange={(evt) => setMailgunApiKey(evt.currentTarget.value)} />
                </div>

                <div className='my-4'>
                  <label htmlFor='mailgunDomain'>Mailgun domain</label>
                  <input className='input-default' type='text' name='mailgunDomain' value={mailgunDomain} placeholder='Mailgun domain (e.g. mail.domain.com)'
                    onChange={(evt) => setMailgunDomain(evt.currentTarget.value)} />
                </div>

                <div className='my-4'>
                  <label htmlFor='mailgunHost'>Mailgun host</label>
                  <select className='input-default' name='mailgunHost' value={mailgunHost} onChange={(evt) => setMailgunHost(evt.currentTarget.value)}>
                    <option value=''>US (api.mailgun.net)</option>
                    <option value='api.eu.mailgun.net'>EU (api.eu.mailgun.net)</option>
                  </select>
                </div>
              </>
            }

            <SpinnerButton
              text='Save'
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
  )
}

export const getServerSideProps: GetServerSideProps = async (context: any): Promise<any> => {
  const session = await getSession(context);
  if (!session) {
    return {
      props: {}
    }
  }

  const connection = await dbConnection('mailSettings');
  const publicationRepository = connection.getRepository(Publication);
  const publications = await publicationRepository.find({ relations: ["mailSettings"] });
  await connection.close();

  for (let i = 0; i < publications.length; i++) {
    let publication = publications[i];
    if (publication.mailSettingsId && publication.mailSettings && publication.mailSettings.mailgunApiKey) {
      publication.mailSettings.mailgunApiKey = CryptoUtils.decryptKey(publication.mailSettings.mailgunApiKey);
    }
  };

  return {
    props: {
      publications: JSON.parse(JSON.stringify(publications))
    }
  }
}
