export interface UserStats {
  projects: number
  tasks: number
  completedTasks: number
}

export interface User {
  id: string
  slug: string
  name: string
  email: string
  avatar?: string
  role: "admin" | "lider" | "colaborador"
  department: string
  cargo?: string
  status: "ativo" | "inativo" | "suspenso"
  lastActive: string | null
  phone?: string
  location?: string
  joinedAt: string
  bio?: string
  skills: string[]
  stats: UserStats
}

export type UserRole = User["role"]
export type UserStatus = User["status"]

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  lider: "Líder",
  colaborador: "Colaborador",
}

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-purple-100 text-purple-700 border-purple-200",
  lider: "bg-amber-100 text-amber-700 border-amber-200",
  colaborador: "bg-gray-100 text-gray-700 border-gray-200",
}

export const STATUS_LABELS: Record<UserStatus, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  suspenso: "Suspenso",
}

export const STATUS_COLORS: Record<UserStatus, string> = {
  ativo: "bg-green-500",
  inativo: "bg-yellow-500",
  suspenso: "bg-red-500",
}

export const DEPARTMENTS = [
  "Criação",
  "Estratégia",
  "Atendimento",
  "Mídia",
  "Conteúdo",
  "Desenvolvimento",
  "Financeiro",
] as const

export type Department = (typeof DEPARTMENTS)[number]
