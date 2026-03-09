"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { hasMinRole } from "@/lib/permissions";
import type { RoleSlug } from "@/lib/permissions";

interface RBACGuardProps {
  /** Minimum role required (uses hierarchy: founder > diretoria > lider > colaborador) */
  minRole?: RoleSlug;
  /** Whitelist of specific roles allowed */
  allowedRoles?: RoleSlug[];
  /** Where to redirect on access denied. Defaults to "/dashboard" */
  redirectTo?: string;
  children: React.ReactNode;
}

/**
 * Page-level RBAC guard.
 *
 * Renders null while role is loading — prevents child components from
 * mounting and React Query hooks from firing before the role is resolved.
 *
 * On access denied: redirects instead of showing inline AccessDenied
 * (use RequireRole for inline section guards within a page).
 *
 * Must be the outermost wrapper in a page component.
 */
export function RBACGuard({
  minRole,
  allowedRoles,
  redirectTo = "/dashboard",
  children,
}: RBACGuardProps) {
  const role = useAuthStore((s) => s.role);
  const router = useRouter();

  const isAllowed =
    role !== null &&
    (!minRole || hasMinRole(role, minRole)) &&
    (!allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(role));

  useEffect(() => {
    if (role !== null && !isAllowed) {
      router.replace(redirectTo);
    }
  }, [role, isAllowed, router, redirectTo]);

  // Block render while loading OR if access is denied
  if (role === null || !isAllowed) return null;

  return <>{children}</>;
}
