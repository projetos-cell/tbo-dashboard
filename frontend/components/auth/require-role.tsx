"use client";

import { useAuthStore } from "@/stores/auth-store";
import type { RoleSlug } from "@/lib/permissions";
import { hasMinRole } from "@/lib/permissions";
import { ShieldAlert } from "lucide-react";

interface RequireRoleProps {
  /** Roles that can see this content (whitelist) */
  allowed?: RoleSlug[];
  /** Minimum role in the hierarchy (founder > diretoria > lider > colaborador) */
  minRole?: RoleSlug;
  /** Module slug required (uses the modules list from auth store) */
  module?: string;
  /** Custom fallback UI when access is denied */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <ShieldAlert className="h-12 w-12 text-muted-foreground/50" />
      <div>
        <h2 className="text-lg font-semibold">Acesso restrito</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Voce nao tem permissao para acessar este modulo.
          <br />
          Fale com o founder caso precise de acesso.
        </p>
      </div>
    </div>
  );
}

/**
 * Guard component that shows children only if the user has the required role
 * or module access. Shows a fallback (or default AccessDenied) otherwise.
 *
 * Supports two modes:
 * - `allowed`: whitelist of specific roles
 * - `minRole`: minimum hierarchy level (uses ROLE_HIERARCHY)
 *
 * While the role is still loading (null), renders nothing to avoid flash.
 */
export function RequireRole({
  allowed,
  minRole,
  module,
  fallback,
  children,
}: RequireRoleProps) {
  const role = useAuthStore((s) => s.role);
  const modules = useAuthStore((s) => s.modules);

  // Still loading -- show nothing to avoid flicker
  if (role === null) {
    return null;
  }

  // Check module access
  if (module) {
    const hasModule = modules.includes("*") || modules.includes(module);
    if (!hasModule) {
      return <>{fallback ?? <AccessDenied />}</>;
    }
  }

  // Check minimum role in hierarchy
  if (minRole) {
    if (!hasMinRole(role, minRole)) {
      return <>{fallback ?? <AccessDenied />}</>;
    }
  }

  // Check role whitelist
  if (allowed && allowed.length > 0) {
    if (!allowed.includes(role)) {
      return <>{fallback ?? <AccessDenied />}</>;
    }
  }

  return <>{children}</>;
}
