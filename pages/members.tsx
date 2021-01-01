import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import Head from "next/head";
import AdminPageContainer from "../components/adminContainer";
import { Member, Publication } from "../models";
import { dbConnection } from "../repository";
import moment from 'moment';
import Tooltip from "../components/tooltip";
import Modal from 'react-modal';
import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer, ToastOptions } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';
import Link from "next/link";

const toastConfig: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  closeOnClick: true,
  pauseOnHover: true,
};

export default function Members(props: {
  members: Member[],
  publicationId: string,
}) {
  const [memberToDelete, setMemberToDelete] = useState<Member | undefined>();
  const [deleteMemberLoading, setDeleteMemberLoading] = useState(false);
  const [memberToResendEmail, setMemberToResendEmail] = useState<Member | undefined>();
  const [resendEmailLoading, setResendEmailLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [members, setMembers] = useState(props.members);
  return (
    <AdminPageContainer>
      <Head>
        <title>Members ({props.members.length})</title>
      </Head>
      <div className='flex flex-col justify-center items-center px-1'>
        <div className='flex justify-between w-4/5 mt-4'>
          <h2>Members ({props.members.length})</h2>

          <div className='flex justify-center items-center'>
            <Link href={`/publication/${props.publicationId}/import-members`}>
              <a className='btn-default'>Import members</a>
            </Link>
          </div>
        </div>
        <div className='w-4/5'>
          <table className='w-full table-auto'>
            <thead>
              <tr>
                <th>Email</th>
                <th>Email verified</th>
                <th>Sign up date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
                (members || []).map((member, index) =>
                  <tr key={index}>
                    <td>{member.email}</td>
                    <td>{member.emailVerified ? <strong className='text-green-600'>Yes</strong> : <strong className='text-red-600'>No</strong>}</td>
                    <td>{moment(new Date(member.createdAt || '')).format('DD-MM-YYYY, HH:mm').toLowerCase()}</td>
                    <td className='text-right'>
                      {
                        !member.emailVerified &&
                        <Tooltip
                          content={<small className='flex text-center'>Resend verification email</small>}>
                          <button type='button' className='border border-gray-200 hover:bg-gray-200 text-black p-2 rounded items-center mr-2'
                            onClick={() => {
                              setMemberToResendEmail(member);
                              setShowResendModal(true);
                            }}>
                            <svg className='w-6 h-6' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        </Tooltip>
                      }
                      <Tooltip
                        content={<small className='flex text-center'>Delete member</small>}>
                        <button type='button' className='border border-gray-200 hover:bg-gray-200 text-red-600 p-2 rounded items-center'
                          onClick={() => {
                            setMemberToDelete(member);
                            setShowDeleteModal(true);
                          }}>
                          <svg className='w-6 h-6' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </Tooltip>
                    </td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        className='generic-modal'
        overlayClassName='overlay-generic-modal'
        ariaHideApp={false}
        portalClassName="portal-generic-modal"
        shouldCloseOnOverlayClick
        shouldCloseOnEsc
        onRequestClose={(evt) => {
          evt.preventDefault();
          setMemberToDelete(undefined);
          setShowDeleteModal(false);
        }}
        isOpen={showDeleteModal}
        contentLabel="Confirm delete member">
        <div>
          <h3>Delete member with email {memberToDelete?.email}?</h3>
          <div className='flex justify-between'>
            <button className='btn-success mr-2 w-2/5' disabled={deleteMemberLoading}
              onClick={() => {
                setDeleteMemberLoading(true);
                axios.delete(`/api/member/delete?memberId=${memberToDelete?.id}`,
                  { withCredentials: true })
                  .then(() => {
                    const memberIndex = members.indexOf(memberToDelete as any);
                    if (memberIndex > -1) {
                      toast.success(`Member '${memberToDelete?.email}' deleted.`, toastConfig);
                      members.splice(memberIndex, 1);
                      setMembers(members);
                      setDeleteMemberLoading(false);
                      setMemberToDelete(undefined);
                      setShowDeleteModal(false);
                    }
                  })
                  .catch(error => {
                    setDeleteMemberLoading(false);
                    setMemberToDelete(undefined);
                    setShowDeleteModal(false);
                    if (error.response.data) {
                      toast.error(error.response.data, toastConfig);
                    } else {
                      toast.error('An error occurred while deleting member.', toastConfig);
                    }
                  })
              }}>
              {
                deleteMemberLoading ?
                  <span>Deleting...</span>
                  :
                  <span>Yes</span>
              }
            </button>
            <button className='btn-danger w-2/5' onClick={() => {
              setMemberToDelete(undefined);
              setShowDeleteModal(false);
            }}>
              <span>No</span>
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        className='generic-modal'
        overlayClassName='overlay-generic-modal'
        ariaHideApp={false}
        portalClassName="portal-generic-modal"
        shouldCloseOnOverlayClick
        shouldCloseOnEsc
        onRequestClose={(evt) => {
          evt.preventDefault();
          setMemberToResendEmail(undefined);
          setShowResendModal(false);
        }}
        isOpen={showResendModal}
        contentLabel="Confirm email resend">
        <div>
          <h3>Resend verification email to {memberToResendEmail?.email}?</h3>
          <div className='flex justify-between'>
            <button className='btn-success mr-2 w-2/5' disabled={resendEmailLoading}
              onClick={(evt) => {
                setResendEmailLoading(true);
                axios.get(`/api/member/resend-verification-mail?memberId=${memberToResendEmail?.id}`,
                  { withCredentials: true })
                  .then(() => {
                    toast.success(`Verification email sent to ${memberToResendEmail?.email}`, toastConfig);
                    setResendEmailLoading(false);
                    setMemberToResendEmail(undefined);
                    setShowResendModal(false);
                  })
                  .catch(error => {
                    setResendEmailLoading(false);
                    setMemberToResendEmail(undefined);
                    setShowResendModal(false);
                    if (error.response.data) {
                      toast.error(error.response.data, toastConfig);
                    } else {
                      toast.error('An error occurred while sending verification mail.', toastConfig);
                    }
                  })
              }}>
              {
                resendEmailLoading ?
                  <span>Sending...</span>
                  :
                  <span>Yes</span>
              }
            </button>
            <button className='btn-danger w-2/5' onClick={() => {
              setMemberToResendEmail(undefined);
              setShowResendModal(false);
            }}>No</button>
          </div>
        </div>
      </Modal>

      <ToastContainer />
    </AdminPageContainer>
  );
}

export const getServerSideProps: GetServerSideProps = async (context: any): Promise<any> => {
  const session = await getSession(context);
  if (!session) {
    return {
      props: {}
    };
  }

  const connection = await dbConnection('member');
  const memberRepository = connection.getRepository(Member);
  const members = await memberRepository.createQueryBuilder('members').orderBy('members.created_at', 'DESC').getMany();
  const publicationRepository = connection.getRepository(Publication);
  const publication = await publicationRepository.findOne();
  await connection.close();

  return {
    props: {
      members: JSON.parse(JSON.stringify(members)),
      publicationId: publication?.id,
    }
  };
}
