import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    businessId?: string | null;
    role?: "owner" | "member" | null;
  }
  interface Session {
    user: {
      id: string;
      businessId?: string | null;
      role?: "owner" | "member" | null;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    businessId?: string | null;
    role?: "owner" | "member" | null;
  }
}
