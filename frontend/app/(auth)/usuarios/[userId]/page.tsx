"use client"

import { use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { IconArrowLeft, IconAlertTriangle } from "@tabler/icons-react"
import Link from "next/link"
import { ProfileHeader } from "@/features/usuarios/components/profile-header"
import { ProfileCompletion } from "@/features/usuarios/components/profile-completion"
import { ProfileSkills } from "@/features/usuarios/components/profile-skills"
import { ProfileTabs } from "@/features/usuarios/components/profile-tabs"
import { useTeamMember } from "@/hooks/use-team"
import { profileToUser } from "@/features/usuarios/utils/profile-to-user"

interface PageProps {
  params: Promise<{ userId: string }>
}

export default function UserProfilePage({ params }: PageProps) {
  const { userId } = use(params)
  const { data: member, isLoading, error, refetch } = useTeamMember(userId)

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
  if (error || !member) {
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

  const user = profileToUser(member as unknown as Record<string, unknown>)

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
          <ProfileHeader user={user} />
          <ProfileCompletion user={user} />
          <ProfileSkills user={user} />
        </div>

        {/* Right column */}
        <div className="lg:col-span-2">
          <ProfileTabs user={user} />
        </div>
      </div>
    </div>
  )
}
