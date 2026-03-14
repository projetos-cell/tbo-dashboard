"use client"

import { use, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { IconArrowLeft, IconAlertTriangle } from "@tabler/icons-react"
import Link from "next/link"
import { ProfileHeader } from "@/features/usuarios/components/profile-header"
import { ProfileCompletion } from "@/features/usuarios/components/profile-completion"
import { ProfileSkills } from "@/features/usuarios/components/profile-skills"
import { ProfileTabs } from "@/features/usuarios/components/profile-tabs"
import { useTeamMembers } from "@/hooks/use-team"
import { profileToUser } from "@/features/usuarios/utils/profile-to-user"
import { EditUserDialog } from "@/components/modules/team/edit-user-dialog"
import { useAuthStore } from "@/stores/auth-store"
import type { TeamMember } from "@/schemas/team"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function UserProfilePage({ params }: PageProps) {
  const { slug } = use(params)
  const { data: members, isLoading, error, refetch } = useTeamMembers()
  const currentRole = useAuthStore((s) => s.role) ?? "colaborador"
  const [editOpen, setEditOpen] = useState(false)

  const { user, rawMember } = useMemo(() => {
    if (!members) return { user: null, rawMember: null }
    for (const m of members) {
      const u = profileToUser(m as unknown as Record<string, unknown>)
      if (u.slug === slug) return { user: u, rawMember: m }
    }
    return { user: null, rawMember: null }
  }, [members, slug])

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            <Card>
              <CardContent className="flex flex-col items-center gap-4 p-6">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  // ── Error / Not Found ──
  if (error || !user) {
    return (
      <div className="space-y-6">
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/usuarios">
              <IconArrowLeft className="mr-1.5 h-4 w-4" />
              Voltar para Usuários
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <IconAlertTriangle className="h-10 w-10 text-destructive" />
            <div className="text-center">
              <p className="font-medium">
                {error ? "Erro ao carregar perfil" : "Usuário não encontrado"}
              </p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "O usuário solicitado não existe ou foi removido."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/usuarios">Ver todos</Link>
              </Button>
              {error && (
                <Button variant="outline" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/usuarios">
            <IconArrowLeft className="mr-1.5 h-4 w-4" />
            Voltar para Usuários
          </Link>
        </Button>
      </div>

      {/* 2-column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-1">
          <ProfileHeader user={user} onEdit={() => setEditOpen(true)} />
          <ProfileCompletion user={user} />
          <ProfileSkills user={user} />
        </div>

        {/* Right column */}
        <div className="lg:col-span-2">
          <ProfileTabs user={user} />
        </div>
      </div>

      {/* Edit dialog */}
      <EditUserDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        member={rawMember as TeamMember | null}
        currentUserRole={currentRole}
      />
    </div>
  )
}
