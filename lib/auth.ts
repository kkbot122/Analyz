// lib/auth.ts
import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
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
  activeOrgId?: string | null; // ✅ Added this
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
    activeOrgId?: string | null;
  }
}

// 3. Define the options
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
          where: { email: credentials.email.toLowerCase() }, // ✅ Lowercase check
        });

        if (!user || !user.password) {
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  callbacks: {
    async jwt({ token, user, trigger, session: updateSession }) {
      if (user || trigger === "signIn" || trigger === "update") {
        const userId = user?.id || token.sub as string;
        const userEmail = user?.email || token.email || "";
        
        // --- Auto-Accept Logic (Preserved from your code) ---
        if (userEmail) {
          try {
            const pendingInvites = await prisma.invite.findMany({
              where: {
                email: userEmail.toLowerCase(),
                expiresAt: { gt: new Date() },
              },
              include: { organization: true, project: true },
            });
            
            for (const invite of pendingInvites) {
              // 1. Add Membership
              await prisma.membership.upsert({
                where: {
                    userId_organizationId: {
                        userId: userId,
                        organizationId: invite.organizationId
                    }
                },
                create: {
                  userId: userId,
                  organizationId: invite.organizationId,
                  role: invite.role,
                },
                update: {}
              });
              
              // 2. Add Project Membership
              if (invite.projectId) {
                const existing = await prisma.projectMember.findFirst({
                    where: { userId, projectId: invite.projectId }
                });
                if (!existing) {
                    await prisma.projectMember.create({
                        data: {
                            userId,
                            projectId: invite.projectId,
                            role: "MEMBER"
                        }
                    });
                }
              }

              // 3. Delete Invite
              await prisma.invite.delete({ where: { id: invite.id } });
            }
          } catch (e) {
            console.error("Auto-accept error", e);
          }
        }

        // --- Fetch Orgs ---
        const orgs = await prisma.membership.findMany({
            where: { userId: userId },
            include: { 
                organization: { include: { projects: { include: { members: { where: { userId } } } } } } 
            }
        });

        // Map data to token
        token.user = {
            id: userId,
            email: userEmail,
            name: user?.name || token.name || null,
            organizations: orgs.map(m => ({
                id: m.organization.id,
                name: m.organization.name,
                role: m.role,
                projects: m.organization.projects.map(p => ({
                    id: p.id,
                    name: p.name,
                    role: p.members[0]?.role || 'MEMBER'
                }))
            }))
        } as ExtendedUser;

        // ✅ IMPORTANT: Set Active Org ID
        // If we have orgs, default to the first one.
        if (orgs.length > 0) {
            token.activeOrgId = orgs[0].organizationId;
        } else {
            token.activeOrgId = null;
        }
      }

      // Handle Session Update manually
      if (trigger === "update" && updateSession?.user) {
        token.user = { ...token.user, ...updateSession.user };
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (token.user) {
        session.user = {
          ...session.user,
          ...token.user,
          // ✅ FIX: Explicitly pass activeOrgId from token to session user
          activeOrgId: token.activeOrgId 
        };
      }
      return session;
    },
  },
  
  pages: {
    signIn: "/auth/login",
  },
  debug: process.env.NODE_ENV === "development",
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);