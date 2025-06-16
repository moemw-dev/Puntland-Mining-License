import type React from "react"
import { MoreVertical, FileBadge, FileCheck2, ShieldAlert, File } from "lucide-react"
import { cn } from "@/lib/utils"
import { License } from "@/types"
import config from "@/lib/config/config"

interface MetricCardProps {
  value: string | number
  label: string
  icon: React.ReactNode
  iconClassName?: string
  className?: string
}

//fetch license data from api
async function getLicenses(): Promise<License[]> {
  const res = await fetch(`${config.env.apiEndpoint}/api/licenses`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-cache'
  })
  const data = await res.json()
  return data;
}

async function getSamples(): Promise<License[]> {
  const res = await fetch(`${config.env.apiEndpoint}/api/samples`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-cache'
  })
  const data = await res.json()
  return data;
}

const MetricCard = ({ value, label, icon, iconClassName, className }: MetricCardProps) => {
  return (
    <div className={cn("relative rounded-xl border p-6", className)}>
      <button className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
        <MoreVertical size={16} />
      </button>
      <div className="flex items-center gap-4">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-full", iconClassName)}>{icon}</div>
        <div>
          <div className="text-3xl font-bold">{value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  )
}

export default async function MetricCards() {
  const licenses = await getLicenses();
  const samples = await getSamples();

  const now = new Date();

  const activeLicenses = licenses.filter((license) => {
    const expireDate = new Date(license.expire_date);
    return expireDate >= now;
  });

  const expiredLicenses = licenses.filter((license) => {
    const expireDate = new Date(license.expire_date);
    return expireDate < now;
  });

  const totalLicenses = licenses.length;
  const totalSamples = samples.length;

  // loading
  if(!totalLicenses && !totalSamples && !activeLicenses.length && !expiredLicenses.length) return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        value={"0"}
        label={"Loading..."}
        icon={<FileBadge className="h-6 w-6 text-indigo-600" />}
        iconClassName="bg-indigo-100"
      />
      <MetricCard
        value={"0"}
        label={"Loading..."}
        icon={<FileCheck2 className="h-6 w-6 text-cyan-600" />}
        iconClassName="bg-cyan-100"
      />
      <MetricCard
        value={"0"}
        label={"Loading..."}
        icon={<ShieldAlert className="h-6 w-6 text-orange-600" />}
        iconClassName="bg-orange-100"
      />
      <MetricCard
        value={"0"}
        label={"Loading..."}
        icon={<File className="h-6 w-6 text-pink-600" />}
        iconClassName="bg-pink-100"
      />
    </div>
  )


  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        value={totalLicenses}
        label="Total Licenses"
        icon={<FileBadge className="h-6 w-6 text-indigo-600" />}
        iconClassName="bg-indigo-100"
      />
      <MetricCard
        value={activeLicenses.length}
        label="Active Licenses"
        icon={<FileCheck2 className="h-6 w-6 text-cyan-600" />}
        iconClassName="bg-cyan-100"
      />
      <MetricCard
        value={expiredLicenses.length}
        label="Expired Licenses"
        icon={<ShieldAlert className="h-6 w-6 text-orange-600" />}
        iconClassName="bg-orange-100"
      />
      <MetricCard
        value={totalSamples}
        label="Total Samples"
        icon={<File className="h-6 w-6 text-pink-600" />}
        iconClassName="bg-pink-100"
      />
    </div>
  )
}
