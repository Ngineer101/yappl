export default function EditPost(props: any) {
  return (
    <div>
      <h1>Draft</h1>
      <label>Username: {props.username}</label>
      <br />
      <label>Post ID: {props.postId}</label>
    </div>
  )
}

export function getServerSideProps(context: any) {
  const { username, postId } = context.params;
  // TODO: Get draft post
  return {
    props: {
      username,
      postId,
    }
  }
}
