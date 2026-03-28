"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { type User } from "../types"
import { UsersTablePagination } from "./users-table-pagination"
import { UserRow } from "./user-row"

interface UsersTableProps {
  users: User[]
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onEdit: (user: User) => void
  onToggleActive: (user: User) => void
  onDelete: (user: User) => void
}

export function UsersTable({
  users,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onToggleActive,
  onDelete,
}: UsersTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // NOTE(single-tenant): Base ~10-20 usuários — paginação client-side é suficiente.
  // Para multi-tenant ou bases maiores, implementar server-side via Supabase .range().
  const totalItems = users.length
  const start = page * pageSize
  const end = Math.min(start + pageSize, totalItems)
  const paginatedUsers = users.slice(start, end)

  const allSelected =
    paginatedUsers.length > 0 &&
    paginatedUsers.every((u) => selectedIds.has(u.id))

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedUsers.map((u) => u.id)))
    }
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Selecionar todos"
                />
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Último Acesso</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <p className="text-sm">Nenhum usuário encontrado.</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/configuracoes?tab=usuarios">Convidar membro</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  selected={selectedIds.has(user.id)}
                  onToggle={() => toggleOne(user.id)}
                  onEdit={onEdit}
                  onToggleActive={onToggleActive}
                  onDelete={onDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UsersTablePagination
        totalItems={totalItems}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
}
