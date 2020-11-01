export default function Unauthorized() {
  return (
    <div className='flex flex-col justify-center items-center p-1'>
      <h1 className='header-2xl text-center mb-10'>Please sign in to access this page</h1>
      <img className='img-2xl' src={require('../public/assets/unauthorized.svg')} />
    </div>
  );
}
