import NextAuth, { type User } from "next-auth";
import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
     maxAge: 60 * 60 // 1 hour
  },
  jwt: {
  maxAge: 60 * 60,
},
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email.toString()))
          .limit(1);

        if (user.length === 0) return null;

        const isPasswordValid = await compare(
          credentials.password.toString(),
          user[0].password as string
        );

        if (!isPasswordValid) return null;

        return {
          id: user[0].id.toString(),
          email: user[0].email,
          name: user[0].name,
          role: user[0].role,
        } as User;
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Make sure to explicitly include the role when the user signs in
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          name: user.name,
        };
      }
      // Return the token as is for subsequent requests
      return token;
    },
    async session({ session, token }) {
      // Make sure to explicitly set all properties on the session
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          role: token.role,
          name: token.name,
          email: token.email,
        },
      };
    },
  },
});
