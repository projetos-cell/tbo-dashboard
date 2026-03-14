"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconUserPlus, IconRefresh } from "@tabler/icons-react";
import { useTeamMembers } from "@/hooks/use-team";
import type { TeamMember, TeamFilters } from "@/schemas/team";
import { type RoleSlug, hasMinRole } from "@/lib/permissions";
import type { SortingState, OnChangeFn } from "@tanstack/react-table";
import { InviteUserDialog } from "./invite-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import { TeamStatsCards } from "./team-stats-cards";
import { TeamToolbar } from "./team-toolbar";
import { TeamTable } from "./team-table";

// ────────────────────────────────────────────────────
// Debounce hook
// ────────────────────────────────────────────────────

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ────────────────────────────────────────────────────
// Props
// ────────────────────────────────────────────────────

type TeamManagementPageProps = {
  currentUserId: string;
  currentUserRole: RoleSlug;
};

// ────────────────────────────────────────────────────
// Page component
// ────────────────────────────────────────────────────

export function TeamManagementPage({
  currentUserId,
  currentUserRole,
}: TeamManagementPageProps) {
  const [filters, setFilters] = useState<TeamFilters>({});
  const [searchInput, setSearchInput] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const handleSortingChange: OnChangeFn<SortingState> = setSorting;
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [deleteMember, setDeleteMember] = useState<TeamMember | null>(null);

  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const activeFilters = useMemo<TeamFilters>(
    () => ({ ...filters, search: debouncedSearch || undefined }),
    [filters, debouncedSearch]
  );

  const hasActiveFilters = !!(
    filters.role || filters.is_active !== undefined || debouncedSearch
  );

  const { data: members = [], isLoading, refetch } = useTeamMembers(activeFilters);
  const { data: allMembers } = useTeamMembers();
  const statsSource = hasActiveFilters ? (allMembers ?? members) : members;

  const canManageUsers = hasMinRole(currentUserRole, "diretoria");
  const activeCount = statsSource.filter((m) => m.is_active).length;

  function handleClearFilters() {
    setFilters({});
    setSearchInput("");
  }

  function handleRoleClick(role: RoleSlug) {
    setFilters((f) => ({ ...f, role: f.role === role ? undefined : role }));
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Equipe</h1>
            <p className="text-sm text-muted-foreground">
              {statsSource.length} membros &middot; {activeCount} ativos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => refetch()}>
                  <IconRefresh size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Atualizar lista</TooltipContent>
            </Tooltip>
            {canManageUsers && (
              <Button onClick={() => setInviteOpen(true)}>
                <IconUserPlus size={16} className="mr-2" />
                Convidar membro
              </Button>
            )}
          </div>
        </div>

        <TeamStatsCards
          members={statsSource}
          activeRole={filters.role}
          onRoleClick={handleRoleClick}
        />

        <TeamToolbar
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          filters={filters}
          onFilterChange={setFilters}
        />

        <TeamTable
          members={members}
          isLoading={isLoading}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          hasActiveFilters={hasActiveFilters}
          onInvite={() => setInviteOpen(true)}
          onEdit={setEditMember}
          onDelete={setDeleteMember}
          onClearFilters={handleClearFilters}
        />

        <InviteUserDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          currentUserRole={currentUserRole}
        />
        <EditUserDialog
          open={!!editMember}
          onOpenChange={(open) => !open && setEditMember(null)}
          member={editMember}
          currentUserRole={currentUserRole}
        />
        <DeleteUserDialog
          open={!!deleteMember}
          onOpenChange={(open) => !open && setDeleteMember(null)}
          member={deleteMember}
        />
      </div>
    </TooltipProvider>
  );
}
