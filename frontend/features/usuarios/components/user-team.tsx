"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { ROLE_LABELS, ROLE_COLORS } from "../types"
import { slugify } from "../utils/slugify"
import { getInitials } from "../utils/get-initials"

interface UserTeamProps {
  department: string
  currentUserId: string
}

export function UserTeam({ department, currentUserId }: UserTeamProps) {
  const supabase = createClient()

  const { data: teamMembers, isLoading, isError, refetch } = useQuery({
    queryKey: ["user-team", department],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role, is_active")
        .eq("department", department)
        .eq("is_active", true)
        .neq("id", currentUserId)
        .order("full_name")
        .limit(20)

      if (error) throw error
      return data ?? []
    },
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12">
          <p className="text-sm font-medium text-destructive">Erro ao carregar equipe</p>
          <button
            onClick={() => refetch()}
            className="text-xs text-muted-foreground underline underline-offset-2"
          >
            Tentar novamente
          </button>
        </CardContent>
      </Card>
    )
  }

  if (!teamMembers || teamMembers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12">
          <p className="text-sm font-medium">Nenhum colega no departamento</p>
          <p className="text-xs text-muted-foreground">
            Não há outros membros ativos em {department}.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-2">
            <Link href="/configuracoes?tab=usuarios">Convidar membro</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Equipe de {department}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {teamMembers.map((member) => {
            const role = (member.role ?? "colaborador") as keyof typeof ROLE_LABELS
            const memberSlug = slugify(member.full_name || "")
            return (
              <Link
                key={member.id}
                href={`/usuarios/${memberSlug}`}
                className="flex items-center gap-3 rounded-md p-1 transition-colors hover:bg-muted/50"
              >
                <Avatar className="h-8 w-8">
                  {member.avatar_url && (
                    <AvatarImage src={member.avatar_url} />
                  )}
                  <AvatarFallback className="text-xs">
                    {getInitials(member.full_name || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">
                    {member.full_name}
                  </p>
                </div>
                <Badge variant="outline" className={ROLE_COLORS[role]}>
                  {ROLE_LABELS[role]}
                </Badge>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
