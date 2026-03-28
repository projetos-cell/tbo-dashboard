"use client";

import { type ReactNode } from "react";
import { useAuthStore } from "@/stores/auth-store";

export type Role = "admin" | "lider" | "colaborador";

const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 4,
  lider: 2,
  colaborador: 1,
};

interface RBACGuardProps {
  children: ReactNode;
  minRole?: Role;
  allowedRoles?: Role[];
  fallback?: ReactNode;
}

export function RBACGuard({ children, minRole, allowedRoles, fallback = null }: RBACGuardProps) {
  const role = useAuthStore((s) => s.role);
  const userRole = role as Role;

  if (!userRole) return fallback;

  const hasAccess = allowedRoles
    ? allowedRoles.includes(userRole)
    : minRole
      ? ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole]
      : true;

  if (!hasAccess) return <>{fallback}</>;
  return <>{children}</>;
}
