// app/api/categories/route.ts

import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const GetUsers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        emailVerified: users.emailVerified,
        image: users.image,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        

    }
    ).from(users);

    return NextResponse.json(GetUsers);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Waa la waayay categories" }, { status: 500 });
  }
}