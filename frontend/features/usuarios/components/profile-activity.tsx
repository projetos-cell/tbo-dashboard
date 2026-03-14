"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  IconCheck,
  IconPlus,
  IconEdit,
  IconTrash,
  IconShield,
  IconActivity,
} from "@tabler/icons-react"
import { createClient } from "@/lib/supabase/client"
import { formatRelativeDate } from "../utils/format-date"
import type { AuditAction } from "@/lib/audit-trail"

const ACTION_CONFIG: Record<
  AuditAction,
  { icon: typeof IconCheck; color: string; label: string }
> = {
  create: { icon: IconPlus, color: "text-blue-500", label: "Criou" },
  update: { icon: IconEdit, color: "text-gray-500", label: "Atualizou" },
  delete: { icon: IconTrash, color: "text-red-500", label: "Removeu" },
  status_change: { icon: IconCheck, color: "text-green-500", label: "Alterou status" },
  permission_change: { icon: IconShield, color: "text-purple-500", label: "Alterou permissão" },
}

interface ProfileActivityProps {
  userId: string
  limit?: number
}

export function ProfileActivity({ userId, limit }: ProfileActivityProps) {
  const supabase = createClient()

  const { data: activities, isLoading } = useQuery({
    queryKey: ["user-activity", userId, limit],
    queryFn: async () => {
      const query = supabase
        .from("audit_log")
        .select("id, action, entity_type, entity_id, to_state, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (limit) query.limit(limit)
      else query.limit(20)

      const { data, error } = await query
      if (error) throw error
      return data ?? []
    },
    staleTime: 1000 * 60 * 3,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: limit ?? 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2 py-8">
          <IconActivity className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Nenhuma atividade registrada ainda.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const action = activity.action as AuditAction
            const config = ACTION_CONFIG[action] ?? ACTION_CONFIG.update
            const Icon = config.icon
            const entityLabel = activity.entity_type?.replace(/_/g, " ") ?? "registro"

            return (
              <div key={activity.id} className="flex gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    {config.label} {entityLabel}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatRelativeDate(activity.created_at ?? new Date().toISOString())}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
