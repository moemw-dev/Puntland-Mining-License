// app/api/categories/route.ts

import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { NextResponse } from "next/server";


export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json([], { status: 200 }); // Si aan error u keenin front-end
  }

  // if (session.user.role !== "SUPER_ADMIN") {
  //   return NextResponse.json([], { status: 200 }); // Si aan map error u keenin
  // }

  const result = await db.select().from(users);
  return NextResponse.json(result);
}

