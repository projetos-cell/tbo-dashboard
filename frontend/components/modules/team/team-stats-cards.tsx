"use client";

import { Card, CardContent } from "@/components/ui/card";
import { IconShieldCog } from "@tabler/icons-react";
import { ROLE_CONFIG } from "./team-ui";
import type { TeamMember } from "@/schemas/team";
import type { RoleSlug } from "@/lib/permissions";

interface TeamStatsCardsProps {
  members: TeamMember[];
  activeRole: RoleSlug | undefined;
  onRoleClick: (role: RoleSlug) => void;
}

export function TeamStatsCards({
  members,
  activeRole,
  onRoleClick,
}: TeamStatsCardsProps) {
  const byRole = members.reduce(
    (acc, m) => {
      acc[m.role] = (acc[m.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const roles = ["founder", "diretoria", "lider", "colaborador"] as const;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {roles.map((role) => (
        <Card
          key={role}
          className={`cursor-pointer transition-colors hover:border-brand/40 ${
            activeRole === role ? "border-brand/60 bg-brand/5" : ""
          }`}
          onClick={() => onRoleClick(role)}
        >
          <CardContent className="flex items-center justify-between p-3">
            <div>
              <p className="text-xs text-muted-foreground">
                {ROLE_CONFIG[role].label}
              </p>
              <p className="text-xl font-bold">{byRole[role] ?? 0}</p>
            </div>
            <IconShieldCog
              size={20}
              className={
                activeRole === role
                  ? "text-brand"
                  : "text-muted-foreground/40"
              }
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
