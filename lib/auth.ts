// lib/auth.ts
import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// 1. Define custom types
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

// 2. Augment NextAuth types
declare module "next-auth" {
  interface Session {
    user: ExtendedUser & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: ExtendedUser;
  }
}

// 3. Define the options
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any), // removed 'as any' - usually not needed if types match
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

        if (!user || !user.password) { // prisma types usually include password as string | null
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
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
      allowDangerousEmailAccountLinking: true, // Optional: enables linking accounts if email matches
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!, // Added '!' to fix TS error
      clientSecret: process.env.GITHUB_CLIENT_SECRET!, // Added '!' to fix TS error
      allowDangerousEmailAccountLinking: true, // Recommended if you want same-email logic for GH and Google
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session: updateSession }) {
      if (user || trigger === "signIn" || trigger === "update") {
        try {
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

      if (trigger === "update" && updateSession?.user) {
        token.user = {
          ...token.user,
          ...updateSession.user,
        } as ExtendedUser;
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
    signIn: "/auth/login",
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser && user.email) {
        console.log(`New user registered: ${user.email}`);
      }
    },
  },
};