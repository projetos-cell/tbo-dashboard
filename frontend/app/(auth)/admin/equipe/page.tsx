"use client";

import { RequireRole } from "@/features/auth/components/require-role";
import { useAuthStore } from "@/stores/auth-store";
import { TeamManagementPage } from "@/components/modules/team";
import type { RoleSlug } from "@/lib/permissions";

export default function TeamPage() {
  const user = useAuthStore((s) => s.user);
  const appRole = useAuthStore((s) => s.role) as RoleSlug | null;

  if (!user || !appRole) return null;

  return (
    <RequireRole allowed={["admin"]} module="admin">
      <TeamManagementPage
        currentUserId={user.id}
        currentUserRole={appRole}
      />
    </RequireRole>
  );
}
