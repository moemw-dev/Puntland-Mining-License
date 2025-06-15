import type { License } from "@/types"
import LicenseDetails from "@/components/license-details"
import config from "@/lib/config/config"

interface Props {
  params: Promise<{ id: string }>
}

async function getLicenseById(id: string): Promise<License | null> {
  const res = await fetch(`${config.env.apiEndpoint}/api/licenses/${id}`, {
    cache: "no-cache",
  })

  if (!res.ok) return null

  const data = await res.json()
  return data
}

const Page = async ({ params }: Props) => {
  const { id } = await params
  const license = await getLicenseById(id)

  if (!license) {
    return <div>License not found</div>
  }

  return (
    <>
      <LicenseDetails license={license} />
    </>
  )
}

export default Page
