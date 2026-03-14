"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { UsersStats } from "@/features/usuarios/components/users-stats"
import { UsersFilters } from "@/features/usuarios/components/users-filters"
import { UsersTable } from "@/features/usuarios/components/users-table"
import { mockUsers } from "@/features/usuarios/data/mock-users"
import type { UserRole, UserStatus } from "@/features/usuarios/types"

export default function UsuariosPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<UserStatus | "todos">("todos")
  const [roleFilter, setRoleFilter] = useState<UserRole | "todos">("todos")
  const [departmentFilter, setDepartmentFilter] = useState("todos")
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const filteredUsers = useMemo(() => {
    let result = mockUsers

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      )
    }

    // Status
    if (statusFilter !== "todos") {
      result = result.filter((u) => u.status === statusFilter)
    }

    // Role
    if (roleFilter !== "todos") {
      result = result.filter((u) => u.role === roleFilter)
    }

    // Department
    if (departmentFilter !== "todos") {
      result = result.filter((u) => u.department === departmentFilter)
    }

    return result
  }, [search, statusFilter, roleFilter, departmentFilter])

  // Reset page when filters change
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários"
        description="Gerencie membros, cargos e permissões."
      />

      <UsersStats users={mockUsers} />

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
