import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@codesync/db";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any),
  session: { strategy: "jwt" },

  providers: [
    //  Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    //  GitHub OAuth
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const res = await fetch(`${BACKEND_URL}/api/auth/signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!res.ok) return null;

        const data = await res.json() as { user: { id: string; name: string | null; email: string | null; image: string | null }; token: string };
        if (!data.user) return null;

        // Attach the backend JWT to the user object so we can pass it to the session
        return { ...data.user, backendToken: data.token };
      },
    }),
  ],

  callbacks: {
    // Store the backend JWT and user id inside the NextAuth JWT token
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.backendToken = (user as any).backendToken;

        // If this is an OAuth login and we don't have a backendToken yet, fetch one
        if (account?.provider && account.provider !== "credentials" && !token.backendToken) {
          try {
            const res = await fetch(`${BACKEND_URL}/api/auth/oauth-token`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: user.email }),
            });
            if (res.ok) {
              const data = await res.json() as { token: string };
              token.backendToken = data.token;
            }
          } catch (error) {
            console.error("Failed to fetch OAuth backend token:", error);
          }
        }
      }
      return token;
    },
    // Expose user id and backend JWT to the client session
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).backendToken = token.backendToken as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};
