import { auth } from "@/auth"
import { redirect } from "next/navigation"
import UserProfile from "@/components/user-profile"

const Page = async () => {
  const session = await auth()

   if (!session) {
    redirect("/login")
  }

  return (
    <div>
      <UserProfile session={session} />
    </div>
  )
}

export default Page
