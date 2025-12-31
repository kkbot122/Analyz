import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";
import { UserAvatar } from "@/components/user-avatar";
import { ProjectAccessModal } from "@/components/project-access-modal";

export default async function TeamPage({ params }: { params: Promise<{ orgId: string }> }) {
  const session = await getServerSession(authOptions);
  const { orgId } = await params;

  if (!session?.user?.id) return <div>Unauthorized</div>;

  // 1. Fetch Org Members & Their Project Access
  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      projects: true, 
      members: { // ensure this matches your schema relation name
        include: {
          user: true,
        },
      },
    },
  });

  // 2. ✅ Fetch CURRENT USER'S Role
  const currentUserMembership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: orgId,
      },
    },
  });

  // ✅ Determine if they can edit
  const isOrgOwner = currentUserMembership?.role === "ORG_OWNER";

  // 3. Fetch Project Memberships
  const projectMemberships = await prisma.projectMember.findMany({
    where: {
      project: { organizationId: orgId },
    },
  });

  if (!organization) return <div>Org not found</div>;

  return (
    <div className="min-h-screen bg-[#f0eeef] text-black flex font-sans">
      <Sidebar currentOrgId={orgId} showSettings={true} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Team Management</h1>
                    <p className="text-gray-500 mt-1">Manage access to {organization.name}</p>
                </div>
            </div>

            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-400 font-bold">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Org Role</th>
                            <th className="px-6 py-4">Projects Access</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {organization.members.map((membership) => {
                            const userProjects = projectMemberships
                                .filter(pm => pm.userId === membership.userId)
                                .map(pm => pm.projectId);

                            return (
                                <tr key={membership.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar user={membership.user} size="sm" />
                                            <div>
                                                <div className="font-bold text-sm">{membership.user.name}</div>
                                                <div className="text-xs text-gray-400">{membership.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-600">
                                            {membership.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {userProjects.length > 0 ? (
                                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                                    {userProjects.length} Projects
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">No projects</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {/* ✅ Pass the permission down */}
                                        <ProjectAccessModal 
                                            user={membership.user} 
                                            allProjects={organization.projects}
                                            userProjectIds={userProjects}
                                            canEdit={isOrgOwner} 
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
}