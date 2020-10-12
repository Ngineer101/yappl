import Dante from 'Dante2';

export default function EditPost(props: any) {
  return (
    <div>
      <h1>Draft</h1>
      <label>Publication Id: {props.publicationId}</label>
      <br />
      <label>Post ID: {props.postId}</label>
      <hr />
      <Dante />
    </div>
  )
}

export function getServerSideProps(context: any) {
  const { publicationId, postId } = context.params;
  // TODO: Get draft post
  return {
    props: {
      publicationId,
      postId,
    }
  }
}
