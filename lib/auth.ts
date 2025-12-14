// lib/auth.ts
import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import type { NextAuthOptions } from "next-auth";


// 1. Define your custom types separately to reuse them
type OrganizationInfo = {
  id: string;
  name: string;
  role: string;
  projects: Array<{
    id: string;
    name: string;
    role: string;
  }>;
};

type ExtendedUser = {
  id: string;
  email: string;
  name?: string | null;
  organizations: OrganizationInfo[];
};

// 2. Correctly augment the modules without recursive inheritance
declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: ExtendedUser & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /**
   * Returned by the `jwt` callback and `getToken`, when using JWT sessions
   */
  interface JWT {
    // Interfaces merge automatically, so we just add the property we need
    user: ExtendedUser;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any),
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Safe casting for password check since Prisma types might exclude it depending on selection
        const userWithPassword = user as any;

        if (!user || !userWithPassword?.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          userWithPassword.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session: updateSession }) {
      // Fetch organizations on every sign in or update
      if (user || trigger === "signIn" || trigger === "update") {
        try {
          // Robust ID retrieval
          const userId = user?.id || token.user?.id || (token.sub as string);

          if (userId) {
            const orgs = await prisma.membership.findMany({
              where: { userId: userId },
              include: {
                organization: {
                  include: {
                    projects: {
                      include: {
                        members: {
                          where: { userId: userId },
                          select: { role: true },
                        },
                      },
                    },
                  },
                },
              },
            });

            token.user = {
              id: userId,
              email: user?.email || token.email || token.user?.email || "",
              name: user?.name || token.name || token.user?.name || null,
              organizations: orgs.map((m) => ({
                id: m.organization.id,
                name: m.organization.name,
                role: m.role,
                projects: m.organization.projects
                  .filter((p) => p.members.length > 0)
                  .map((p) => ({
                    id: p.id,
                    name: p.name,
                    role: p.members[0].role,
                  })),
              })),
            };
          }
        } catch (error) {
          console.error("Error fetching organizations:", error);
          // Fallback to preserve basic user info if DB fetch fails
          if (!token.user) {
             token.user = {
                id: user?.id || (token.sub as string),
                email: user?.email || token.email || "",
                name: user?.name || token.name || null,
                organizations: [],
             };
          }
        }
      }

      // Handle session updates (like when org is created)
      if (trigger === "update" && updateSession?.user) {
        token.user = {
          ...token.user,
          ...updateSession.user,
        } as ExtendedUser; // Explicit cast often helps here
      }

      return token;
    },

    async session({ session, token }) {
      if (token.user) {
        session.user = {
            ...session.user,
            ...token.user
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login", // Removed (pages) group syntax as it's usually internal to Next.js routing, not the URL
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser && user.email) {
        console.log(`New user registered: ${user.email}`);
      }
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);