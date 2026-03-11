import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      // En login, guardar datos del usuario
      if (user) {
        token.id = user.id as string;
        token.businessId = user.businessId;
        token.role = user.role;
      }
      // Si el token existente no tiene role, recuperarlo de la DB
      if (!token.role && token.id) {
        const [dbUser] = await db
          .select({ role: users.role })
          .from(users)
          .where(eq(users.id, token.id as string))
          .limit(1);
        if (dbUser) token.role = dbUser.role as "owner" | "member";
      }
      return token;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) return null;

        const isValid = await compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          businessId: user.businessId,
          role: user.role as "owner" | "member",
        };
      },
    }),
  ],
});
