import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
     secureCookie: request.nextUrl.protocol === "https:"
  })

  const { pathname } = request.nextUrl

  // Define simple route-role mapping
  const protectedRoutes = {
    "/users": ["SUPER_ADMIN"],
    "/reports": ["SUPER_ADMIN", "DIRECTOR", "MINISTER"],
    "/sample-analysis": ["SUPER_ADMIN", "DIRECTOR"],
  }

  // Check if user is logged in
  if (!token) {
     console.error("❌ Token is not present");
    return NextResponse.redirect(new URL("/login", request.url))
  }
  if (!token.role) {
  console.error("❌ Token role is not present");
  return NextResponse.redirect(new URL("/unauthorized", request.url));
}

  const userRole = token.role as string

  // Check if current path needs protection
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!userRole || !allowedRoles.includes(userRole)) {
        // Redirect to dashboard with error
        return NextResponse.redirect(new URL("/?error=unauthorized", request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Only protect specific routes
    "/users/:path*",
    "/admin/:path*",
    "/reports/:path*",
    "/sample-analysis/:path*",
  ],
}
