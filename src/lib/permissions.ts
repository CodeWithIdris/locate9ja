export const ORG_ROLES = ["owner", "admin", "manager", "developer", "analyst", "member", "viewer"] as const;
export type OrgRole = (typeof ORG_ROLES)[number];

export const ROLE_LABELS: Record<OrgRole, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  developer: "Developer",
  analyst: "Analyst",
  member: "Member",
  viewer: "Viewer",
};

const CAPABILITIES = {
  manageOrganization: ["owner", "admin"],
  manageTeam: ["owner", "admin"],
  manageDevelopers: ["owner", "admin", "developer"],
  manageOperations: ["owner", "admin", "manager", "member"],
  viewAnalytics: ["owner", "admin", "manager", "developer", "analyst", "member", "viewer"],
} satisfies Record<string, OrgRole[]>;

export type Capability = keyof typeof CAPABILITIES;

export function hasCapability(role: string | null | undefined, capability: Capability) {
  return Boolean(role && CAPABILITIES[capability].includes(role as OrgRole));
}