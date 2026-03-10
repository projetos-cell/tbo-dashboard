"use client";

import { RequireRole } from "@/features/auth/components/require-role";
import { useAuthStore } from "@/stores/auth-store";
import { TeamManagementPage } from "@/components/modules/team";
import type { TBORole } from "@/constants/roles";

// Map app-level RBAC roles to team management roles
const ROLE_MAP: Record<string, TBORole> = {
  founder: "socio",
  diretoria: "product_owner",
  lider: "colaborador",
  colaborador: "viewer",
};

export default function TeamPage() {
  const user = useAuthStore((s) => s.user);
  const appRole = useAuthStore((s) => s.role);

  const teamRole: TBORole = ROLE_MAP[appRole ?? ""] ?? "guest";

  if (!user) return null;

  return (
    <RequireRole allowed={["founder", "diretoria"]} module="admin">
      <TeamManagementPage
        currentUserId={user.id}
        currentUserRole={teamRole}
      />
    </RequireRole>
  );
}
