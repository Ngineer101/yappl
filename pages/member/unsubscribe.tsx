import { GetServerSideProps } from "next";
import { Member } from "../../models";
import { dbConnection } from "../../repository";
import Container from '../../components/container';
import Head from 'next/head';

export default function UnsubscribeMember(props: any) {
  return (
    <Container>
      {
        props.unsubscribed &&
        <>
          <Head>
            <title>Unsubscribed successfully</title>
          </Head>
          <div className='full-page'>
            <div className='flex flex-col justify-center items-center p-1'>
              <h1 className='header-2xl text-center mb-10'>You have successfully unsubscribed.</h1>
              <img className='img-2xl' src={require('../../public/assets/banner.svg')} alt='you have successfully unsubscribed' />
            </div>
          </div>
        </>
      }
      {
        !props.unsubscribed &&
        <>
          <Head>
            <title>Unsubscribe failed</title>
          </Head>
          <div className='full-page'>
            <div className='flex flex-col justify-center items-center p-1'>
              <h1 className='header-2xl text-center mb-10'>Unsubscribe failed. Please reload the page.</h1>
              <img className='img-2xl' src={require('../../public/assets/servererror.svg')} alt='server error' />
            </div>
          </div>
        </>
      }
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async (context: any): Promise<any> => {
  const { e, token } = context.query;
  const buff = Buffer.from(e as string, 'base64');
  const decodedEmail = buff.toString('ascii');

  const connection = await dbConnection('member');
  const memberRepository = connection.getRepository(Member);
  const member = await memberRepository.findOne({ email: decodedEmail, verificationToken: token as string });
  if (member) {
    await memberRepository.remove(member);
    await connection.close();
    return {
      props: {
        unsubscribed: true
      }
    }
  } else {
    await connection.close();
    return {
      props: {
        unsubscribed: true
      }
    }
  }
}
