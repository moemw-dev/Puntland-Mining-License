import { auth } from "@/auth"
import UserProfile from "@/components/user-profile"

const Page = async () => {
  const session = await auth()

   if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    }
  }

  return (
    <div>
      <UserProfile session={session} />
    </div>
  )
}

export default Page
