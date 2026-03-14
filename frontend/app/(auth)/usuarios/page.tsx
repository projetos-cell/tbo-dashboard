"use client"

import { useState, useMemo, useCallback } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { UsersStats } from "@/features/usuarios/components/users-stats"
import { UsersFilters } from "@/features/usuarios/components/users-filters"
import { UsersTable } from "@/features/usuarios/components/users-table"
import { useTeamMembers, useToggleUserActive, useDeleteTeamMember } from "@/hooks/use-team"
import { useAuthStore } from "@/stores/auth-store"
import type { User, UserRole, UserStatus } from "@/features/usuarios/types"
import { ROLE_LABELS, STATUS_LABELS } from "@/features/usuarios/types"
import { profileToUser } from "@/features/usuarios/utils/profile-to-user"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { IconAlertTriangle } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { EditUserDialog } from "@/components/modules/team/edit-user-dialog"
import { InviteUserDialog } from "@/components/modules/team/invite-user-dialog"
import { DeleteUserDialog } from "@/components/modules/team/delete-user-dialog"
import type { TeamMember } from "@/schemas/team"

// ────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────

function userToTeamMember(user: User): TeamMember {
  return {
    id: user.id,
    email: user.email,
    full_name: user.name,
    avatar_url: user.avatar ?? null,
    role: user.role,
    department: user.department === "—" ? null : user.department,
    is_active: user.status === "ativo",
    created_at: user.joinedAt,
    updated_at: user.lastActive,
  }
}

function exportToCsv(users: User[]) {
  const headers = ["Nome", "Email", "Cargo", "Departamento", "Status", "Último Acesso"]
  const rows = users.map((u) => [
    u.name,
    u.email,
    ROLE_LABELS[u.role],
    u.department,
    STATUS_LABELS[u.status],
    new Date(u.lastActive).toLocaleDateString("pt-BR"),
  ])

  const csvContent = [
    headers.join(","),
    ...rows.map((r) => r.map((cell) => `"${cell}"`).join(",")),
  ].join("\n")

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `usuarios-tbo-${new Date().toISOString().split("T")[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────

export default function UsuariosPage() {
  const { data: members, isLoading, error, refetch } = useTeamMembers()
  const toggleActive = useToggleUserActive()
  const deleteMember = useDeleteTeamMember()
  const currentRole = useAuthStore((s) => s.role) ?? "colaborador"

  // Filters
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<UserStatus | "todos">("todos")
  const [roleFilter, setRoleFilter] = useState<UserRole | "todos">("todos")
  const [departmentFilter, setDepartmentFilter] = useState("todos")
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  // Dialogs
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

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

  // ── Handlers ──

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

  const handleEdit = useCallback((user: User) => {
    setSelectedMember(userToTeamMember(user))
    setEditOpen(true)
  }, [])

  const handleToggleActive = useCallback(
    (user: User) => {
      toggleActive.mutate({ id: user.id, is_active: user.status !== "ativo" })
    },
    [toggleActive]
  )

  const handleDelete = useCallback((user: User) => {
    setSelectedMember(userToTeamMember(user))
    setDeleteOpen(true)
  }, [])

  const handleExport = useCallback(() => {
    exportToCsv(filteredUsers)
  }, [filteredUsers])

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
        onExport={handleExport}
        onInvite={() => setInviteOpen(true)}
      />

      <UsersTable
        users={filteredUsers}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleEdit}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
      />

      {/* Dialogs */}
      <InviteUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        currentUserRole={currentRole}
      />

      <EditUserDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        member={selectedMember}
        currentUserRole={currentRole}
      />

      <DeleteUserDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        member={selectedMember}
      />
    </div>
  )
}
