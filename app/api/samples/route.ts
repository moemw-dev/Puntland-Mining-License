import { db } from "@/database/drizzle";
import { sampleAnalysis } from "@/database/schema";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const getSamples = await db.select().from(sampleAnalysis);

    return NextResponse.json(getSamples);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Waa la waayay categories" }, { status: 500 });
  }
}
