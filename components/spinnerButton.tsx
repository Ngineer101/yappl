export default function SpinnerButton(props: {
  onClick?: (evt: any) => void,
  text: string,
  loading: boolean,
  type: "button" | "submit" | "reset" | undefined,
  disabled: boolean,
  className?: string
}) {
  return (
    <button className={`${props.className ? props.className : ''} flex justify-center btn-default relative`} disabled={props.disabled} type={props.type} onClick={props.onClick}>
      <span className={props.loading ? 'opacity-30' : ''} style={{ paddingTop: '0.125rem' }}>
        {props.text}
      </span>
      {
        props.loading &&
        <div className='absolute'>
          <svg className="animate-spin h-4 w-4 m-1 rounded-full border-2"
            style={{ borderColor: 'white white black black' }} viewBox="0 0 24 24"></svg>
        </div>
      }
    </button>
  )
}
