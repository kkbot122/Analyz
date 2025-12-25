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
          where: { email: credentials.email },
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
  
  // ✅ ADD THESE OPTIONS
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  callbacks: {
    async jwt({ token, user, trigger, session: updateSession }) {
      // Initial sign-in
      if (user || trigger === "signIn" || trigger === "update") {
        const userId = user?.id || token.sub as string;
        const userEmail = user?.email || token.email || "";
        
        // ✅ ADDED: Auto-accept pending invites for new users
        if (userEmail) {
          try {
            const pendingInvites = await prisma.invite.findMany({
              where: {
                email: userEmail.toLowerCase(),
                expiresAt: {
                  gt: new Date(), // Not expired
                },
              },
              include: {
                organization: true,
                project: true,
              },
            });
            
            // Auto-accept all pending invites
            for (const invite of pendingInvites) {
              try {
                // Check if user is already a member (avoid duplicates)
                const existingMembership = await prisma.membership.findUnique({
                  where: {
                    userId_organizationId: {
                      userId: userId,
                      organizationId: invite.organizationId,
                    },
                  },
                });
                
                if (!existingMembership) {
                  // Add to organization
                  await prisma.membership.create({
                    data: {
                      userId: userId,
                      organizationId: invite.organizationId,
                      role: invite.role,
                    },
                  });
                  
                  console.log(`Auto-accepted invite to ${invite.organization.name} for ${userEmail}`);
                }
                
                // Add to project if specified
                if (invite.projectId) {
                  const existingProjectMember = await prisma.projectMember.findUnique({
                    where: {
                      userId_projectId: {
                        userId: userId,
                        projectId: invite.projectId,
                      },
                    },
                  });
                  
                  if (!existingProjectMember) {
                    await prisma.projectMember.create({
                      data: {
                        userId: userId,
                        projectId: invite.projectId,
                        role: "MEMBER", // Default project role for invites
                      },
                    });
                  }
                }
                
                // Delete the invite
                await prisma.invite.delete({
                  where: { id: invite.id },
                });
                
              } catch (error: any) {
                // Ignore duplicate entry errors (already a member)
                if (!error.message?.includes("Unique constraint") && 
                    !error.message?.includes("P2002")) {
                  console.error("Error auto-accepting invite:", error);
                }
              }
            }
          } catch (error) {
            console.error("Error checking for pending invites:", error);
          }
        }
        
        // ✅ UPDATED: Fetch organizations AFTER auto-accepting invites
        try {
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
            email: userEmail,
            name: user?.name || token.name || null,
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
          
          // Set active org to first one if available
          if (orgs.length > 0) {
            token.activeOrgId = orgs[0].organizationId;
          } else {
            token.activeOrgId = null;
          }
          
        } catch (error) {
          console.error("Error fetching organizations:", error);
          token.user = {
            id: userId,
            email: userEmail,
            name: user?.name || token.name || null,
            organizations: [],
          };
          token.activeOrgId = null;
        }
      }
      
      // Session update
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
          ...token.user,
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
  
  // ✅ Enable debug in development
  debug: process.env.NODE_ENV === "development",
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);