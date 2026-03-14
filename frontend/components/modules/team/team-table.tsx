"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
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
  IconArrowUp,
  IconArrowDown,
  IconChevronLeft,
  IconChevronRight,
  IconRefresh,
  IconUsers,
  IconUserPlus,
} from "@tabler/icons-react";
import type { TeamMember } from "@/schemas/team";
import { type RoleSlug } from "@/lib/permissions";
import { useTeamTableColumns } from "./team-table-columns";

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
  const canManageUsers = currentUserRole === "founder" || currentUserRole === "diretoria";

  const columns = useTeamTableColumns({
    currentUserId,
    currentUserRole,
    onEdit,
    onDelete,
  });

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
