"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"

interface UserProjectsProps {
  userId: string
}

export function UserProjects({ userId }: UserProjectsProps) {
  const supabase = createClient()

  const { data: projects, isLoading, isError, refetch } = useQuery({
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

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12">
          <p className="text-sm font-medium text-destructive">Erro ao carregar demandas</p>
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

  if (!projects || projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12">
          <p className="text-sm font-medium">Nenhuma demanda atribuída</p>
          <p className="text-xs text-muted-foreground">
            Quando demandas forem atribuídas a este usuário, elas aparecerão aqui.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-2">
            <Link href="/projetos">Atribuir demanda</Link>
          </Button>
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
