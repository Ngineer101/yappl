import { useRouter } from "next/router";

export default function ImportPublication() {
  const router = useRouter()
  const { userId } = router.query
  return (
    <div>
      {userId}
    </div>
  );
}