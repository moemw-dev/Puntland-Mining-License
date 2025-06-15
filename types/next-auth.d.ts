import type { DefaultSession } from "next-auth"

// Extend the built-in session types
declare module "next-auth" {
  interface User {
    id: string
    role?: string
    name?: string | null
    email?: string | null
  }

  interface Session {
    user: {
      id: string
      role?: string
      name?: string | null
      email?: string | null
    } & DefaultSession["user"]
  }
}

// Extend JWT type
declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
    name?: string | null
    email?: string | null
  }
}
