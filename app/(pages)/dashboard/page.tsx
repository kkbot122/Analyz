// app/(pages)/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Type assertion since we extended the Session type
  const user = session.user as any;
  
  // Check if user has organizations
  if (!user.organizations || user.organizations.length === 0) {
    redirect("/onboarding/create-org");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Your Organizations:</h2>
      <ul>
        {user.organizations.map((org: any) => (
          <li key={org.id}>
            <strong>{org.name}</strong> - {org.role}
            {org.projects.length > 0 && (
              <ul>
                {org.projects.map((project: any) => (
                  <li key={project.id}>{project.name} ({project.role})</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}