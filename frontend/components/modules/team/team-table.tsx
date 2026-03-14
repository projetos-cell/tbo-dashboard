"use client";

import { useMemo, useCallback, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
  type OnChangeFn,
} from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconUserOff,
  IconUserCheck,
  IconUsers,
  IconArrowUp,
  IconArrowDown,
  IconChevronLeft,
  IconChevronRight,
  IconRefresh,
  IconUserPlus,
} from "@tabler/icons-react";
import { useToggleUserActive } from "@/hooks/use-team";
import type { TeamMember } from "@/schemas/team";
import { type RoleSlug, hasMinRole, ROLE_HIERARCHY } from "@/lib/permissions";
import { RoleBadge, StatusBadge, UserAvatar } from "./team-ui";

interface TeamTableProps {
  members: TeamMember[];
  isLoading: boolean;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  currentUserId: string;
  currentUserRole: RoleSlug;
  hasActiveFilters: boolean;
  onInvite: () => void;
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
  onClearFilters: () => void;
}

const columnHelper = createColumnHelper<TeamMember>();

export function TeamTable({
  members,
  isLoading,
  sorting,
  onSortingChange,
  currentUserId,
  currentUserRole,
  hasActiveFilters,
  onInvite,
  onEdit,
  onDelete,
  onClearFilters,
}: TeamTableProps) {
  const canManageUsers = hasMinRole(currentUserRole, "diretoria");
  const canDeleteUsers = currentUserRole === "founder";

  const canActOn = useCallback(
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

  const columns = useMemo(
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

  const table = useReactTable({
    data: members,
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  return (
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
                      {flexRender(header.column.columnDef.header, header.getContext())}
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
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <IconRefresh size={16} className="animate-spin" />
                    Carregando equipe...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <IconUsers size={32} className="opacity-40" />
                    <p className="text-sm">Nenhum membro encontrado</p>
                    {canManageUsers && !hasActiveFilters && (
                      <Button variant="outline" size="sm" onClick={onInvite}>
                        <IconUserPlus size={14} className="mr-1" />
                        Convidar primeiro membro
                      </Button>
                    )}
                    {hasActiveFilters && (
                      <Button variant="outline" size="sm" onClick={onClearFilters}>
                        Limpar filtros
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={!row.original.is_active ? "opacity-50" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

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
  );
}
