import { db } from "@/database/drizzle";
import { districts, regions } from "@/database/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const allCategories = await db
      .select({
        regionId: regions.id,
        regionName: regions.name,
        districtId: districts.id,
        districtName: districts.name,
      })
      .from(regions)
      .innerJoin(districts, eq(districts.region_id, regions.id))
      .orderBy(asc(regions.id), asc(districts.id)); // Optional: Order by

    return NextResponse.json(allCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Waa la waayay categories" }, { status: 500 });
  }
}
