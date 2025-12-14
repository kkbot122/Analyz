import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function getActiveOrg() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const cookieStore = await cookies();
  const activeOrgId = cookieStore.get("active_org")?.value;

  // 1. Get ALL memberships for the user to determine which Orgs they can see
  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id },
    include: {
      organization: true, // We need the details to possibly default to the first one
    },
  });

  if (memberships.length === 0) return null;

  // 2. Determine which Org is active (Cookie vs First available)
  const activeMembership = activeOrgId 
    ? memberships.find((m) => m.organization.id === activeOrgId)
    : memberships[0];

  if (!activeMembership) return null;

  // 3. FETCH PROJECTS with Visibility Logic
  // This is the key fix. We fetch projects separately so we can apply the "Where" clause.
  const isOrgOwner = activeMembership.role === "ORG_OWNER";

  const projects = await prisma.project.findMany({
    where: {
      organizationId: activeMembership.organization.id,
      // VISIBILITY LOGIC:
      // If Org Owner -> No extra filter (empty object)
      // If Not Owner -> Must be a member of the project
      ...(isOrgOwner ? {} : {
        members: {
          some: {
            userId: session.user.id
          }
        }
      })
    },
    include: {
      members: {
        where: { userId: session.user.id },
        select: { role: true }
      }
    }
  });

  // 4. Return the combined shape your dashboard expects
  return {
    id: activeMembership.organization.id,
    name: activeMembership.organization.name,
    role: activeMembership.role,
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      // If they are Org Owner but not in the project explicitly, they might not have a project role.
      // We can default them to 'VIEWER' or just show 'OWNER' since they own the org.
      role: p.members[0]?.role || (isOrgOwner ? "ORG ADMIN" : "MEMBER"), 
    }))
  };
}