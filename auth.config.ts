import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/*
  Edge-safe config (no database imports) — used by middleware for route guards
  and shared into the full Node config in auth.ts. The Credentials provider and
  all DB work live in auth.ts so this stays importable from the edge runtime.
*/
export default {
  pages: { signIn: "/sign-in" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const role = auth?.user?.role;
      const path = nextUrl.pathname;
      const isAdmin = path.startsWith("/admin");
      const isAccount = path.startsWith("/account");
      if (isAdmin) return role === "Admin";
      if (isAccount) return Boolean(auth?.user);
      return true;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? session.user.id;
        session.user.role = (token.role as "Customer" | "Admin") ?? "Customer";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
