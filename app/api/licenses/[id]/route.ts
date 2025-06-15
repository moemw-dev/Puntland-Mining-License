// GET single license by ID
import { db } from "@/database/drizzle"
import { licenses, districts } from "@/database/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

interface Context {
  params: Promise<{ id: string }>
}

export async function GET(req: Request, { params }: Context) {
  // Await the params object before accessing its properties
  const resolvedParams = await params
  const licenseId = resolvedParams.id

  try {
    const licenseData = await db
      .select({
        license: licenses,
        district: districts,
      })
      .from(licenses)
      .leftJoin(districts, eq(licenses.district_id, districts.id))
      .where(eq(licenses.id, licenseId))
      .limit(1)

    if (licenseData.length === 0) {
      return NextResponse.json({ error: "License not found" }, { status: 404 })
    }

    const transformed = {
      ...licenseData[0].license,
      location: licenseData[0].district,
    }

    return NextResponse.json(transformed)
  } catch (error) {
    console.error("Error fetching single license:", error)
    return NextResponse.json({ error: `Error ${error}` }, { status: 500 })
  }
}
