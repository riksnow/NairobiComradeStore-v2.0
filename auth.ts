import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import authConfig from "@/auth.config";
import { getModels } from "@/lib/db/get-models";
import { verifyToken } from "@/lib/totp";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        token: { label: "Authenticator code", type: "text" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").toLowerCase().trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;
        try {
          const { User } = await getModels();
          const user = await User.findOne({ email }).lean();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const u = user as any;
          if (!u?.password || !u.isActive) return null;
          const ok = await bcrypt.compare(password, u.password);
          if (!ok) return null;
          // Two-factor: require a valid TOTP code when enabled.
          if (u.twoFactorEnabled) {
            const token = String(credentials?.token ?? "");
            if (!u.twoFactorSecret || !verifyToken(token, u.twoFactorSecret)) return null;
          }
          return { id: String(u._id), name: u.name, email: u.email, role: u.role, image: u.avatar };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account, profile }) {
      // Credentials sign-in: user already carries id/role.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (user) { token.id = (user as any).id; token.role = (user as any).role ?? "Customer"; }

      // Google sign-in: upsert the user and attach id/role.
      if (account?.provider === "google" && token.email) {
        try {
          const { User } = await getModels();
          const email = String(token.email).toLowerCase();
          let u = await User.findOne({ email });
          if (!u) {
            u = await User.create({
              name: token.name ?? profile?.name ?? "Comrade",
              email,
              role: "Customer",
              avatar: token.picture ?? undefined,
              isActive: true,
            });
          }
          token.id = String(u._id);
          token.role = u.role;
        } catch { /* keep token as-is on failure */ }
      }
      return token;
    },
  },
});
