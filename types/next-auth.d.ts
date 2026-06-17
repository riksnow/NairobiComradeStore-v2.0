import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "Customer" | "Admin";
    } & DefaultSession["user"];
  }
  interface User {
    role?: "Customer" | "Admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "Customer" | "Admin";
  }
}
