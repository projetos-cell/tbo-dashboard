// Team-member roles for the team_members table
// Separate from the app-level RBAC in lib/permissions.ts

export type TBORole =
  | "socio"
  | "product_owner"
  | "colaborador"
  | "viewer"
  | "guest";

export const ROLE_HIERARCHY: Record<TBORole, number> = {
  socio: 5,
  product_owner: 4,
  colaborador: 3,
  viewer: 2,
  guest: 1,
};

/**
 * Returns true when `userRole` has at least the same level as `minRole`.
 *
 * Example: hasPermission("product_owner", "colaborador") => true (4 >= 3)
 * Example: hasPermission("viewer", "product_owner") => false (2 < 4)
 */
export function hasPermission(userRole: TBORole, minRole: TBORole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}
