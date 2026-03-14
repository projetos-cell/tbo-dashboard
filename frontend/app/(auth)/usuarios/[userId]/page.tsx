"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { ProfileHeader } from "@/features/usuarios/components/profile-header"
import { ProfileCompletion } from "@/features/usuarios/components/profile-completion"
import { ProfileSkills } from "@/features/usuarios/components/profile-skills"
import { ProfileTabs } from "@/features/usuarios/components/profile-tabs"
import { mockUsers } from "@/features/usuarios/data/mock-users"

interface PageProps {
  params: Promise<{ userId: string }>
}

export default function UserProfilePage({ params }: PageProps) {
  const { userId } = use(params)
  const user = mockUsers.find((u) => u.id === userId)

  if (!user) {
    notFound()
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
