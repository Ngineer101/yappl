import { GetServerSideProps } from "next";
import { Member } from "../../models";
import { dbConnection } from "../../repository";
import Container from '../../components/container';
import Head from 'next/head';

export default function SubscribeMember(props: any) {
  return (
    <Container hideNav>
      {
        props.emailVerified &&
        <>
          <Head>
            <title>Thanks for verifying your email</title>
          </Head>
          <div className='full-page'>
            <div className='flex flex-col justify-center items-center p-1'>
              <h1 className='header-2xl text-center mb-10'>Thanks for verifying your email.</h1>
              <img className='img-2xl' src={require('../../public/assets/success.svg')} />
            </div>
          </div>
        </>
      }
      {
        !props.emailVerified &&
        <>
          <Head>
            <title>Email verification failed</title>
          </Head>
          <div className='full-page'>
            <div className='flex flex-col justify-center items-center p-1'>
              <h1 className='header-2xl text-center mb-10'>Email verification failed. Please reload the page.</h1>
              <img className='img-2xl' src={require('../../public/assets/servererror.svg')} />
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
    member.emailVerified = true;
    await memberRepository.save(member);
    await connection.close();
    return {
      props: {
        emailVerified: true
      }
    }
  } else {
    await connection.close();
    return {
      props: {
        emailVerified: false
      }
    }
  }
}
