"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function OrgSwitcher() {
  const { data } = useSession();
  const router = useRouter();

  if (!data) return null;

  async function switchOrg(orgId: string) {
    await fetch("/api/org/switch", {
      method: "POST",
      body: JSON.stringify({ orgId }),
    });

    router.refresh();
  }

  return (
    <select onChange={(e) => switchOrg(e.target.value)}>
      <option value="">Select org</option>
      {data.user.organizations.map((org) => (
        <option key={org.id} value={org.id}>
          {org.name}
        </option>
      ))}
    </select>
  );
}
