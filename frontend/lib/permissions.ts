// RBAC -- Role-based access control for the frontend
// 4 roles per architecture.md: founder > diretoria > lider > colaborador

export type RoleSlug = "founder" | "diretoria" | "lider" | "colaborador";

/**
 * Role hierarchy -- higher number = more privileges.
 * Used by hasMinRole() for permission checks.
 */
export const ROLE_HIERARCHY: Record<RoleSlug, number> = {
  founder: 4,
  diretoria: 3,
  lider: 2,
  colaborador: 1,
};

/**
 * Modules each role can SEE in the sidebar and access via URL.
 * Founder uses "*" wildcard = unrestricted access.
 */
export const ROLE_MODULES: Record<RoleSlug, string[]> = {
  founder: ["*"],
  diretoria: [
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
    "entregas",
    "reunioes",
    "decisoes",
    "templates",
    "relatorios",
    "intelligence",
    "audit-logs",
  ],
  lider: [
    "dashboard",
    "projetos",
    "tarefas",
    "pessoas",
    "agenda",
    "clientes",
    "contratos",
    "okrs",
    "chat",
    "cultura",
    "entregas",
    "reunioes",
    "decisoes",
    "templates",
    "intelligence",
  ],
  colaborador: [
    "dashboard",
    "projetos",
    "tarefas",
    "agenda",
    "okrs",
    "chat",
    "cultura",
    "entregas",
  ],
};

/**
 * All known module slugs -- used to resolve the "*" wildcard.
 */
const ALL_MODULES = [
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
  "entregas",
  "reunioes",
  "decisoes",
  "templates",
  "changelog",
  "rsm",
  "mercado",
  "relatorios",
  "alerts",
  "portal-cliente",
  "admin",
  "permissoes",
  "conteudo",
  "revisoes",
  "intelligence",
  "diretoria",
  "system-health",
  "audit-logs",
];

/**
 * Super-admin emails -- always treated as founder regardless of DB role.
 * Matches legacy TBO_PERMISSIONS._superAdmins.
 */
export const SUPER_ADMIN_EMAILS = [
  "marco@agenciatbo.com.br",
  "ruy@agenciatbo.com.br",
];

/**
 * Check if userRole meets a minimum role threshold using the hierarchy.
 *
 * Example: hasMinRole("lider", "diretoria") => false (2 < 3)
 * Example: hasMinRole("founder", "diretoria") => true (4 >= 3)
 */
export function hasMinRole(
  userRole: RoleSlug | null,
  minRole: RoleSlug
): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}

/** Check if a role can access a given module slug */
export function canAccessModule(role: RoleSlug, module: string): boolean {
  const allowed = ROLE_MODULES[role];
  if (!allowed) return false;
  return allowed.includes("*") || allowed.includes(module);
}

/**
 * True for founder role (the only role with full admin privileges).
 * Super-admin emails are promoted to founder in the auth service.
 */
export function isAdmin(role: RoleSlug | null): boolean {
  return role === "founder";
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
    return [...ALL_MODULES];
  }
  return modules;
}

/** Default role when DB lookup fails or user has no assignment */
export const DEFAULT_ROLE: RoleSlug = "colaborador";

// ---------------------------------------------------------------------------
// Granular permission keys per architecture.md permission matrix
// ---------------------------------------------------------------------------

export type PermissionKey =
  | "financeiro.view"
  | "pipeline.view"
  | "okrs.create"
  | "okrs.checkin"
  | "projetos.create"
  | "projetos.view_all"
  | "intelligence.full"
  | "intelligence.partial"
  | "rbac.manage"
  | "audit_logs.view"
  | "one_on_one.conduct"
  | "one_on_one.participate"
  | "reconhecimentos";

/**
 * Permission matrix from architecture.md.
 * Maps each permission to the roles that have it.
 */
const PERMISSION_MATRIX: Record<PermissionKey, RoleSlug[]> = {
  "financeiro.view": ["founder", "diretoria"],
  "pipeline.view": ["founder", "diretoria"],
  "okrs.create": ["founder", "diretoria"],
  "okrs.checkin": ["founder", "diretoria", "lider", "colaborador"],
  "projetos.create": ["founder", "diretoria", "lider"],
  "projetos.view_all": ["founder", "diretoria", "lider"],
  "intelligence.full": ["founder", "diretoria"],
  "intelligence.partial": ["founder", "diretoria", "lider"],
  "rbac.manage": ["founder"],
  "audit_logs.view": ["founder", "diretoria"],
  "one_on_one.conduct": ["founder", "diretoria", "lider"],
  "one_on_one.participate": ["founder", "diretoria", "lider", "colaborador"],
  reconhecimentos: ["founder", "diretoria", "lider", "colaborador"],
};

/** Check if a role has a specific granular permission */
export function hasPermission(
  role: RoleSlug | null,
  permission: PermissionKey
): boolean {
  if (!role) return false;
  const allowed = PERMISSION_MATRIX[permission];
  return allowed ? allowed.includes(role) : false;
}
