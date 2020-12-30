import Link from "next/link";
import { Post } from "../models";
import moment from 'moment';

export default function IssueCard(props: {
  post: Post,
}) {
  return (
    <Link href={`/p/${props.post.slug}`}>
      <a className='issue-card adjusted-width cursor-pointer hover:shadow-2xl text-current'>
        <h3 className='text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl text-center mb-1'>{props.post.title}</h3>
        <p className='text-base sm:text-base md:text-lg lg:text-lg xl:text-lg text-center text-gray-500 mt-1'>{props.post.subtitle}</p>
        <p className='mt-1'>
          {
            props.post.publishedAt ?
              moment(props.post.publishedAt).format('ll') :
              moment(props.post.createdAt).format('ll')
          }
        </p>
      </a>
    </Link>
  );
}
