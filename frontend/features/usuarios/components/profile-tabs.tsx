"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ProfileActivity } from "./profile-activity"
import { ROLE_LABELS, ROLE_COLORS, type User } from "../types"
import { formatDate } from "../utils/format-date"
import { slugify } from "../utils/slugify"
import { createClient } from "@/lib/supabase/client"

interface ProfileTabsProps {
  user: User
}

export function ProfileTabs({ user }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="visao-geral">
      <TabsList>
        <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
        <TabsTrigger value="projetos">Projetos</TabsTrigger>
        <TabsTrigger value="atividades">Atividades</TabsTrigger>
        <TabsTrigger value="equipe">Equipe</TabsTrigger>
      </TabsList>

      <TabsContent value="visao-geral" className="mt-4 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sobre</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.bio ? (
              <p className="text-sm leading-relaxed">{user.bio}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma bio adicionada.
              </p>
            )}
            <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
              <div>
                <p className="text-muted-foreground">Departamento</p>
                <p className="font-medium">{user.department}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cargo</p>
                <p className="font-medium">{ROLE_LABELS[user.role]}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Entrou em</p>
                <p className="font-medium">{formatDate(user.joinedAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Último acesso</p>
                <p className="font-medium">{formatDate(user.lastActive)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ProfileActivity userId={user.id} limit={5} />
      </TabsContent>

      <TabsContent value="projetos" className="mt-4">
        <UserProjects userId={user.id} />
      </TabsContent>

      <TabsContent value="atividades" className="mt-4">
        <ProfileActivity userId={user.id} />
      </TabsContent>

      <TabsContent value="equipe" className="mt-4">
        <UserTeam department={user.department} currentUserId={user.id} />
      </TabsContent>
    </Tabs>
  )
}

// ────────────────────────────────────────────────────
// Projects — real data from demands table
// ────────────────────────────────────────────────────

function UserProjects({ userId }: { userId: string }) {
  const supabase = createClient()

  const { data: projects, isLoading } = useQuery({
    queryKey: ["user-projects", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demands")
        .select("id, title, status, project:projects(id, name)")
        .eq("assignee_id", userId)
        .order("updated_at", { ascending: false })
        .limit(20)

      if (error) throw error
      return data ?? []
    },
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12">
          <p className="text-sm font-medium">Nenhuma demanda atribuída</p>
          <p className="text-xs text-muted-foreground">
            Quando demandas forem atribuídas a este usuário, elas aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {projects.map((item) => {
        const project = item.project as { id: string; name: string } | null
        return (
          <Card key={item.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.title}</p>
                {project && (
                  <p className="truncate text-xs text-muted-foreground">
                    {project.name}
                  </p>
                )}
              </div>
              <Badge variant="secondary">{item.status ?? "—"}</Badge>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ────────────────────────────────────────────────────
// Team — real members from same department
// ────────────────────────────────────────────────────

function UserTeam({
  department,
  currentUserId,
}: {
  department: string
  currentUserId: string
}) {
  const supabase = createClient()

  const { data: teamMembers, isLoading } = useQuery({
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

  if (!teamMembers || teamMembers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12">
          <p className="text-sm font-medium">Nenhum colega no departamento</p>
          <p className="text-xs text-muted-foreground">
            Não há outros membros ativos em {department}.
          </p>
        </CardContent>
      </Card>
    )
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
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
