import NextAuth from "next-auth";
import authConfig from "@/auth.config";

// Edge route-guard using the DB-free config. Protects /account and /admin.
export const { auth: middleware } = NextAuth(authConfig);
export default middleware;

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
