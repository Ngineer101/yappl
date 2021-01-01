export default function Tooltip(props: {
  content: string | JSX.Element | undefined,
  children: JSX.Element,
}) {
  return (
    <div className='inline-flex'>
      <div className='relative group'>
        {props.children}
        {
          props.content &&
          <div className="absolute right-1/2 transform translate-x-1/2 top-0 mt-12 p-2 rounded-lg shadow-lg bg-gray-200 hidden z-10 group-hover:block">
            {props.content}
          </div>
        }
      </div>
    </div>
  );
}
