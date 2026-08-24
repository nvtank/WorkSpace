import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { authConfig } from "@/auth.config";

if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET || "GLw0kLPhHXZNa909iJvrPzvYhynq2kWlznJ8msLhphk=";
}
if (!process.env.AUTH_TRUST_HOST) {
  process.env.AUTH_TRUST_HOST = "true";
}

const SECRET = process.env.AUTH_SECRET;

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  secret: SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectDB();
        const input = String(credentials.email).toLowerCase().trim();
        const user = await User.findOne({
          $or: [
            { email: input },
            { email: input.includes("@") ? input : `${input}@lifehub.local` },
          ],
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
          throw new Error(`Tài khoản bị khóa do đăng nhập sai quá nhiều. Thử lại sau ${minutesLeft} phút.`);
        }

        const isValid = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash
        );

        if (!isValid) {
          // Increment failed attempts
          const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
          const updates: any = { failedLoginAttempts: newFailedAttempts };

          // Lock account after 5 failed attempts for 15 minutes
          if (newFailedAttempts >= 5) {
            const lockDuration = 15 * 60 * 1000; // 15 minutes
            updates.lockedUntil = new Date(Date.now() + lockDuration);
          }

          await User.findByIdAndUpdate(user._id, updates);
          return null;
        }

        // Reset failed attempts on successful login
        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
          await User.findByIdAndUpdate(user._id, {
            failedLoginAttempts: 0,
            lockedUntil: null,
          });
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
});
