// RBAC — Role-based access control for the frontend
// Maps each role to the modules it can access and provides helper functions.

export type RoleSlug = "admin" | "founder" | "po" | "member" | "cs" | "freelancer";

/**
 * Modules each role can SEE in the sidebar and access via URL.
 * Admin and Founder use "*" wildcard = unrestricted access.
 */
export const ROLE_MODULES: Record<RoleSlug, string[]> = {
  admin: ["*"],
  founder: ["*"],
  po: [
    "dashboard",
    "projetos",
    "tarefas",
    "pessoas",
    "agenda",
    "comercial",
    "clientes",
    "contratos",
    "okrs",
    "chat",
    "cultura",
    "configuracoes",
  ],
  member: ["projetos", "tarefas", "agenda", "chat", "cultura"],
  cs: [
    "dashboard",
    "projetos",
    "tarefas",
    "agenda",
    "clientes",
    "contratos",
    "chat",
    "cultura",
  ],
  freelancer: ["tarefas", "cultura"],
};

/**
 * Super-admin emails — always treated as admin regardless of DB role.
 * Matches legacy TBO_PERMISSIONS._superAdmins.
 */
export const SUPER_ADMIN_EMAILS = [
  "marco@agenciatbo.com.br",
  "ruy@agenciatbo.com.br",
];

/** Check if a role can access a given module slug */
export function canAccessModule(role: RoleSlug, module: string): boolean {
  const allowed = ROLE_MODULES[role];
  if (!allowed) return false;
  return allowed.includes("*") || allowed.includes(module);
}

/** True for admin or founder role */
export function isAdmin(role: RoleSlug | null): boolean {
  return role === "admin" || role === "founder";
}

/** True if email matches a hardcoded super-admin */
export function isSuperAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
}

/** Get the list of allowed module slugs for a role (resolves wildcard) */
export function getModulesForRole(role: RoleSlug): string[] {
  const modules = ROLE_MODULES[role];
  if (modules.includes("*")) {
    // Return all known modules
    return [
      "dashboard",
      "projetos",
      "tarefas",
      "pessoas",
      "agenda",
      "financeiro",
      "comercial",
      "clientes",
      "contratos",
      "okrs",
      "chat",
      "cultura",
      "configuracoes",
    ];
  }
  return modules;
}

/** Default role when DB lookup fails or user has no assignment */
export const DEFAULT_ROLE: RoleSlug = "member";
