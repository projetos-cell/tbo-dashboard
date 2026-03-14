import type { User, UserRole, UserStatus } from "../types"

/**
 * Maps a raw Supabase profile row to the UI User type.
 */
export function profileToUser(profile: Record<string, unknown>): User {
  const isActive = profile.is_active as boolean | undefined
  const dbStatus = (profile.status as string | null) ?? ""

  let status: UserStatus = "ativo"
  if (isActive === false || dbStatus === "suspended") {
    status = dbStatus === "suspended" ? "suspenso" : "inativo"
  } else if (dbStatus === "inactive") {
    status = "inativo"
  }

  return {
    id: profile.id as string,
    name:
      (profile.full_name as string) ||
      (profile.email as string) ||
      "Sem nome",
    email: (profile.email as string) || "",
    avatar: (profile.avatar_url as string) || undefined,
    role: (profile.role as UserRole) || "colaborador",
    department:
      (profile.department as string) ||
      (profile.bu as string) ||
      "—",
    status,
    lastActive:
      (profile.updated_at as string) ||
      (profile.created_at as string) ||
      new Date().toISOString(),
    phone: (profile.phone as string) || undefined,
    location: undefined,
    joinedAt:
      (profile.start_date as string) ||
      (profile.created_at as string) ||
      new Date().toISOString(),
    bio: (profile.bio as string) || undefined,
    skills: [],
    stats: { projects: 0, tasks: 0, completedTasks: 0 },
  }
}
