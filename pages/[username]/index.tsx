export default function Username(props: any) {
  if (props.user) {
    const { user } = props;
    return (
      <div>
        <h1>Profile page</h1>
        <label>Username: {user.username}</label>
      </div>
    )
  }
  else {
    return (
      <div></div>
    )
  }
}

export function getServerSideProps(context: any) {
  const { username } = context.params;
  // TODO: Get user from database
  const user = { username };
  return {
    props: {
      user
    },
  }
}
