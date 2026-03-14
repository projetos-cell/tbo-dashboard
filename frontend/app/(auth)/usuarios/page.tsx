"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { UsersStats } from "@/features/usuarios/components/users-stats"
import { UsersFilters } from "@/features/usuarios/components/users-filters"
import { UsersTable } from "@/features/usuarios/components/users-table"
import { useTeamMembers } from "@/hooks/use-team"
import type { UserRole, UserStatus } from "@/features/usuarios/types"
import { profileToUser } from "@/features/usuarios/utils/profile-to-user"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { IconAlertTriangle } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

// ────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────

export default function UsuariosPage() {
  const { data: members, isLoading, error, refetch } = useTeamMembers()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<UserStatus | "todos">("todos")
  const [roleFilter, setRoleFilter] = useState<UserRole | "todos">("todos")
  const [departmentFilter, setDepartmentFilter] = useState("todos")
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const allUsers = useMemo(
    () => (members ?? []).map((m) => profileToUser(m as unknown as Record<string, unknown>)),
    [members]
  )

  const filteredUsers = useMemo(() => {
    let result = allUsers

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== "todos") {
      result = result.filter((u) => u.status === statusFilter)
    }

    if (roleFilter !== "todos") {
      result = result.filter((u) => u.role === roleFilter)
    }

    if (departmentFilter !== "todos") {
      result = result.filter((u) => u.department === departmentFilter)
    }

    return result
  }, [allUsers, search, statusFilter, roleFilter, departmentFilter])

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(0)
  }

  function handleStatusChange(value: UserStatus | "todos") {
    setStatusFilter(value)
    setPage(0)
  }

  function handleRoleChange(value: UserRole | "todos") {
    setRoleFilter(value)
    setPage(0)
  }

  function handleDepartmentChange(value: string) {
    setDepartmentFilter(value)
    setPage(0)
  }

  function handlePageSizeChange(size: number) {
    setPageSize(size)
    setPage(0)
  }

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Usuários"
          description="Gerencie membros, cargos e permissões."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 p-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // ── Error ──
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Usuários"
          description="Gerencie membros, cargos e permissões."
        />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <IconAlertTriangle className="h-10 w-10 text-destructive" />
            <div className="text-center">
              <p className="font-medium">Erro ao carregar usuários</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Tente novamente."}
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários"
        description="Gerencie membros, cargos e permissões."
      />

      <UsersStats users={allUsers} />

      <UsersFilters
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        roleFilter={roleFilter}
        onRoleChange={handleRoleChange}
        departmentFilter={departmentFilter}
        onDepartmentChange={handleDepartmentChange}
      />

      <UsersTable
        users={filteredUsers}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
