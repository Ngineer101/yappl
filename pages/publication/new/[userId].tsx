import { useRouter } from "next/router"

export default function NewPublication() {
  const router = useRouter()
  const { userId } = router.query
  return (
    <div>
      {userId}
    </div>
  )
}