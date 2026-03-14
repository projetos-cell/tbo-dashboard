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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  IconDotsVertical,
  IconUser,
  IconEdit,
  IconBan,
  IconCheck,
  IconTrash,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react"
import {
  ROLE_LABELS,
  ROLE_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
  type User,
} from "../types"
import { formatRelativeDate } from "../utils/format-date"

interface UsersTableProps {
  users: User[]
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function UsersTable({
  users,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: UsersTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const totalItems = users.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
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

  // Generate page numbers to display
  function getPageNumbers(): number[] {
    const pages: number[] = []
    const maxVisible = 5
    let startPage = Math.max(0, page - Math.floor(maxVisible / 2))
    const endPage = Math.min(totalPages - 1, startPage + maxVisible - 1)
    startPage = Math.max(0, endPage - maxVisible + 1)
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
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
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="group transition-colors hover:bg-muted/50"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(user.id)}
                      onCheckedChange={() => toggleOne(user.id)}
                      aria-label={`Selecionar ${user.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/usuarios/${user.id}`}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="h-8 w-8">
                        {user.avatar && <AvatarImage src={user.avatar} />}
                        <AvatarFallback className="text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={ROLE_COLORS[user.role]}
                    >
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{user.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${STATUS_COLORS[user.status]}`}
                      />
                      <span className="text-sm">
                        {STATUS_LABELS[user.status]}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelativeDate(user.lastActive)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        >
                          <IconDotsVertical className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/usuarios/${user.id}`}>
                            <IconUser className="mr-2 h-4 w-4" />
                            Ver Perfil
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <IconEdit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === "suspenso" ? (
                          <DropdownMenuItem>
                            <IconCheck className="mr-2 h-4 w-4" />
                            Ativar
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>
                            <IconBan className="mr-2 h-4 w-4" />
                            Suspender
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <IconTrash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Mostrando {totalItems === 0 ? 0 : start + 1}-{end} de{" "}
            {totalItems} resultados
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span>por página</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
          >
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          {getPageNumbers().map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(p)}
            >
              {p + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
          >
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
