import UserUpdateForm from "@/app/(auth)/_components/user-update"
import config from "@/lib/config/config"
import type { TUsers } from "@/types"
import Link from "next/link"

interface Props {
   params: Promise<{ id: string }>
}


async function getUserById(id: string): Promise<TUsers | null> {

  try {
    const res = await fetch(`${config.env.apiEndpoint}/api/users/${id}`, {
      cache: "no-cache",
    })

    if (!res.ok) return null

    const data = await res.json()
    return data
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

const page = async ({ params }: Props) => {
  const {id} = await params
  const user = await getUserById(id)


  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">User Not Found</h1>
          <p className="text-gray-600 mb-6">{`The user with ID ${id} could not be found.`}</p>
          <Link
            href="/users"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Back to Users
          </Link>
        </div>
      </div>
    )
  }

  return <UserUpdateForm user={user} />
}

export default page
