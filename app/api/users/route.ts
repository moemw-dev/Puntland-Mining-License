import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { NextResponse } from "next/server";


export async function GET() {

  const result = await db.select().from(users);
  return NextResponse.json(result);
}

