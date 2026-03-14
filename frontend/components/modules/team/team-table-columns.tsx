"use client";

import { useMemo, useRef } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconUserOff,
  IconUserCheck,
} from "@tabler/icons-react";
import { useToggleUserActive } from "@/hooks/use-team";
import type { TeamMember } from "@/schemas/team";
import { type RoleSlug, hasMinRole, ROLE_HIERARCHY } from "@/lib/permissions";
import { RoleBadge, StatusBadge, UserAvatar } from "./team-ui";

const columnHelper = createColumnHelper<TeamMember>();

interface UseTeamTableColumnsProps {
  currentUserId: string;
  currentUserRole: RoleSlug;
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
}

export function useTeamTableColumns({
  currentUserId,
  currentUserRole,
  onEdit,
  onDelete,
}: UseTeamTableColumnsProps) {
  const canManageUsers = hasMinRole(currentUserRole, "diretoria");
  const canDeleteUsers = currentUserRole === "founder";

  const canActOn = useMemo(
    () =>
      (target: TeamMember): boolean => {
        if (target.id === currentUserId) return false;
        if (currentUserRole === "founder") return true;
        return ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[target.role];
      },
    [currentUserId, currentUserRole]
  );

  const toggleActive = useToggleUserActive();
  const toggleActiveRef = useRef(toggleActive);
  toggleActiveRef.current = toggleActive;

  return useMemo(
    () => [
      columnHelper.display({
        id: "user",
        header: "Membro",
        cell: ({ row }) => {
          const m = row.original;
          return (
            <div className="flex items-center gap-3">
              <UserAvatar name={m.full_name} avatarUrl={m.avatar_url} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{m.full_name}</p>
                <p className="truncate text-xs text-muted-foreground">{m.email}</p>
              </div>
            </div>
          );
        },
        size: 280,
      }),
      columnHelper.accessor("role", {
        header: "Acesso",
        cell: (info) => <RoleBadge role={info.getValue()} />,
        size: 140,
      }),
      columnHelper.accessor("department", {
        header: "Departamento",
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue() ?? "\u2014"}
          </span>
        ),
        size: 160,
      }),
      columnHelper.accessor("is_active", {
        header: "Status",
        cell: (info) => <StatusBadge isActive={info.getValue()} />,
        size: 100,
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const m = row.original;
          if (!canActOn(m)) return null;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <IconDotsVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Acoes</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {canManageUsers && (
                  <DropdownMenuItem onClick={() => onEdit(m)}>
                    <IconEdit size={16} className="mr-2" />
                    Editar dados
                  </DropdownMenuItem>
                )}
                {canManageUsers && (
                  <DropdownMenuItem
                    onClick={() =>
                      toggleActiveRef.current.mutate({
                        id: m.id,
                        is_active: !m.is_active,
                      })
                    }
                  >
                    {m.is_active ? (
                      <>
                        <IconUserOff size={16} className="mr-2" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <IconUserCheck size={16} className="mr-2" />
                        Reativar
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {canDeleteUsers && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(m)}
                      className="text-destructive focus:text-destructive"
                    >
                      <IconTrash size={16} className="mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 60,
      }),
    ],
    [canManageUsers, canDeleteUsers, canActOn, onEdit, onDelete]
  );
}
