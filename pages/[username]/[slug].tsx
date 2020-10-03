export default function Post(props: any) {
  return (
    <div>
      <h1>Post page</h1>
      <label>Username: {props.username}</label>
      <br />
      <label>Slug: {props.slug}</label>
    </div>
  )
}

export function getServerSideProps(context: any) {
  const { username, slug } = context.params;
  // TODO: Get post from storage
  return {
    props: {
      username,
      slug,
    }
  }
}
