"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconSearch, IconDownload, IconUserPlus } from "@tabler/icons-react"
import { DEPARTMENTS, ROLE_LABELS, type UserRole, type UserStatus } from "../types"

interface UsersFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: UserStatus | "todos"
  onStatusChange: (value: UserStatus | "todos") => void
  roleFilter: UserRole | "todos"
  onRoleChange: (value: UserRole | "todos") => void
  departmentFilter: string
  onDepartmentChange: (value: string) => void
  onExport: () => void
  onInvite: () => void
  canManage?: boolean
}

export function UsersFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  roleFilter,
  onRoleChange,
  departmentFilter,
  onDepartmentChange,
  onExport,
  onInvite,
  canManage = false,
}: UsersFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Status tabs */}
      <Tabs
        value={statusFilter}
        onValueChange={(v) => onStatusChange(v as UserStatus | "todos")}
      >
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="ativo">Ativos</TabsTrigger>
          <TabsTrigger value="inativo">Inativos</TabsTrigger>
          <TabsTrigger value="suspenso">Suspensos</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search + filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={roleFilter}
          onValueChange={(v) => onRoleChange(v as UserRole | "todos")}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os cargos</SelectItem>
            {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(
              ([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        <Select
          value={departmentFilter}
          onValueChange={onDepartmentChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os departamentos</SelectItem>
            {DEPARTMENTS.map((dep) => (
              <SelectItem key={dep} value={dep}>
                {dep}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExport}>
            <IconDownload className="mr-1.5 h-4 w-4" />
            Exportar
          </Button>
          {canManage && (
            <Button size="sm" onClick={onInvite}>
              <IconUserPlus className="mr-1.5 h-4 w-4" />
              Adicionar Usuário
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
