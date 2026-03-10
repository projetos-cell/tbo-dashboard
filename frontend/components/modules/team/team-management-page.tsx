"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconUserPlus,
  IconSearch,
  IconDotsVertical,
  IconEdit,
  IconShieldCog,
  IconTrash,
  IconUserOff,
  IconUserCheck,
  IconUsers,
  IconArrowUp,
  IconArrowDown,
  IconChevronLeft,
  IconChevronRight,
  IconRefresh,
} from "@tabler/icons-react";
import { useTeamMembers, useToggleUserActive } from "@/hooks/use-team";
import type { TeamMember, TeamFilters } from "@/schemas/team";
import {
  type RoleSlug,
  hasMinRole,
  ROLE_HIERARCHY,
} from "@/lib/permissions";
import { RoleBadge, StatusBadge, UserAvatar, ROLE_CONFIG } from "./team-ui";
import { InviteUserDialog } from "./invite-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";

// ────────────────────────────────────────────────────
// Props
// ────────────────────────────────────────────────────

type TeamManagementPageProps = {
  currentUserId: string;
  currentUserRole: RoleSlug;
};

// ────────────────────────────────────────────────────
// Column definitions
// ────────────────────────────────────────────────────

const columnHelper = createColumnHelper<TeamMember>();

// ────────────────────────────────────────────────────
// Page component
// ────────────────────────────────────────────────────

export function TeamManagementPage({
  currentUserId,
  currentUserRole,
}: TeamManagementPageProps) {
  // State
  const [filters, setFilters] = useState<TeamFilters>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [deleteMember, setDeleteMember] = useState<TeamMember | null>(null);

  // Data
  const {
    data: members = [],
    isLoading,
    refetch,
  } = useTeamMembers(filters);
  const toggleActive = useToggleUserActive();

  // Permission checks
  const canManageUsers = hasMinRole(currentUserRole, "diretoria");
  const canDeleteUsers = currentUserRole === "founder";

  function canActOn(target: TeamMember): boolean {
    if (target.id === currentUserId) return false;
    if (currentUserRole === "founder") return true;
    return ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[target.role];
  }

  // Columns
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "user",
        header: "Membro",
        cell: ({ row }) => {
          const m = row.original;
          return (
            <div className="flex items-center gap-3">
              <UserAvatar
                name={m.full_name}
                avatarUrl={m.avatar_url}
                size="sm"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {m.full_name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {m.email}
                </p>
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
                  <DropdownMenuItem onClick={() => setEditMember(m)}>
                    <IconEdit size={16} className="mr-2" />
                    Editar dados
                  </DropdownMenuItem>
                )}

                {canManageUsers && (
                  <DropdownMenuItem
                    onClick={() =>
                      toggleActive.mutate({
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
                      onClick={() => setDeleteMember(m)}
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
    [canManageUsers, canDeleteUsers, currentUserId, currentUserRole]
  );

  // Table instance
  const table = useReactTable({
    data: members,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  // Stats
  const stats = useMemo(() => {
    const active = members.filter((m) => m.is_active).length;
    const byRole = members.reduce(
      (acc, m) => {
        acc[m.role] = (acc[m.role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return { total: members.length, active, byRole };
  }, [members]);

  // ────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Equipe</h1>
            <p className="text-sm text-muted-foreground">
              {stats.total} membros &middot; {stats.active} ativos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refetch()}
                >
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

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              "founder",
              "diretoria",
              "lider",
              "colaborador",
            ] as const
          ).map((role) => (
            <Card
              key={role}
              className="cursor-pointer transition-colors hover:border-brand/40"
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  role: f.role === role ? undefined : role,
                }))
              }
            >
              <CardContent className="flex items-center justify-between p-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {ROLE_CONFIG[role].label}
                  </p>
                  <p className="text-xl font-bold">
                    {stats.byRole[role] ?? 0}
                  </p>
                </div>
                <IconShieldCog
                  size={20}
                  className={
                    filters.role === role
                      ? "text-brand"
                      : "text-muted-foreground/40"
                  }
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="relative flex-1 min-w-[200px]">
              <IconSearch
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                className="pl-9"
                value={filters.search ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    search: e.target.value || undefined,
                  }))
                }
              />
            </div>
            <Select
              value={filters.role ?? "all"}
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  role: v === "all" ? undefined : (v as RoleSlug),
                }))
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Todos os niveis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os niveis</SelectItem>
                {(
                  [
                    "founder",
                    "diretoria",
                    "lider",
                    "colaborador",
                  ] as const
                ).map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_CONFIG[role].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={
                filters.is_active === undefined
                  ? "all"
                  : filters.is_active
                    ? "active"
                    : "inactive"
              }
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  is_active: v === "all" ? undefined : v === "active",
                }))
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="cursor-pointer select-none"
                        style={{ width: header.getSize() }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: <IconArrowUp size={14} />,
                            desc: <IconArrowDown size={14} />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center"
                    >
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <IconRefresh
                          size={16}
                          className="animate-spin"
                        />
                        Carregando equipe...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <IconUsers size={32} className="opacity-40" />
                        <p className="text-sm">
                          Nenhum membro encontrado
                        </p>
                        {canManageUsers && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setInviteOpen(true)}
                          >
                            <IconUserPlus size={14} className="mr-1" />
                            Convidar primeiro membro
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className={
                        !row.original.is_active ? "opacity-50" : undefined
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {table.getPageCount() > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Pagina {table.getState().pagination.pageIndex + 1} de{" "}
                  {table.getPageCount()}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={!table.getCanPreviousPage()}
                    onClick={() => table.previousPage()}
                  >
                    <IconChevronLeft size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={!table.getCanNextPage()}
                    onClick={() => table.nextPage()}
                  >
                    <IconChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
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
