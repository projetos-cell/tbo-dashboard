"use client";

import { useAuthStore } from "@/stores/auth-store";
import { isAdmin as checkAdmin, isSuperAdmin } from "@/lib/permissions";
import type { RoleSlug } from "@/lib/permissions";

/** Returns the current user's role slug (null while loading) */
export function useRole(): RoleSlug | null {
  return useAuthStore((s) => s.role);
}

/** True if the current user is admin */
export function useIsAdmin(): boolean {
  const role = useAuthStore((s) => s.role);
  const email = useAuthStore((s) => s.user?.email);
  return checkAdmin(role) || isSuperAdmin(email);
}

/** True if the current user can access the given module slug */
export function useCanAccess(module: string): boolean {
  const modules = useAuthStore((s) => s.modules);
  return modules.includes("*") || modules.includes(module);
}

/** True if the current user has one of the allowed roles */
export function useHasRole(allowed: RoleSlug[]): boolean {
  const role = useAuthStore((s) => s.role);
  if (!role) return false;
  return allowed.includes(role);
}
