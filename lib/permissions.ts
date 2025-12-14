import { OrgRole, ProjectRole } from "@prisma/client";

// --- Organization Level Permissions ---

export function canCreateProject(orgRole: OrgRole) {
  return ["ORG_OWNER", "PROJECT_OWNER"].includes(orgRole);
}

export function canManageOrganization(orgRole: OrgRole) {
  return orgRole === "ORG_OWNER";
}

export function canInviteMembers(orgRole: OrgRole) {
  return ["ORG_OWNER", "PROJECT_OWNER"].includes(orgRole);
}

// --- Project Level Permissions ---

export function canManageProject(projectRole: ProjectRole) {
  return projectRole === "OWNER";
}

export function canDeleteProject(orgRole: OrgRole, projectRole: ProjectRole) {
  // Org Owners can always delete anything. 
  // Project Owners can delete their own projects.
  return orgRole === "ORG_OWNER" || projectRole === "OWNER";
}

export function canInviteToProject(orgRole: OrgRole, projectRole?: ProjectRole) {
  // You can invite if:
  // 1. You own the whole Organization
  // 2. OR You are the Owner of this specific Project
  return orgRole === "ORG_OWNER" || projectRole === "OWNER";
} 