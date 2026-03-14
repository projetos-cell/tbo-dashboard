"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ProfileActivity } from "./profile-activity"
import { ROLE_LABELS, ROLE_COLORS, type User } from "../types"
import { formatDate } from "../utils/format-date"

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
        {/* About */}
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

        {/* Recent activity (limited) */}
        <ProfileActivity user={user} limit={5} />
      </TabsContent>

      <TabsContent value="projetos" className="mt-4">
        <ProjectsPlaceholder user={user} />
      </TabsContent>

      <TabsContent value="atividades" className="mt-4">
        <ProfileActivity user={user} />
      </TabsContent>

      <TabsContent value="equipe" className="mt-4">
        <TeamPlaceholder user={user} />
      </TabsContent>
    </Tabs>
  )
}

function ProjectsPlaceholder({ user }: { user: User }) {
  const mockProjects = [
    { name: "Campanha Institucional", status: "Em andamento" },
    { name: "Redesign Portal", status: "Em andamento" },
    { name: "Social Media Q1", status: "Concluído" },
    { name: "Branding Cliente Alpha", status: "Planejamento" },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {mockProjects.slice(0, user.stats.projects > 4 ? 4 : user.stats.projects).map((project) => (
        <Card key={project.name}>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium">{project.name}</p>
              <p className="text-xs text-muted-foreground">{user.department}</p>
            </div>
            <Badge variant="secondary">{project.status}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TeamPlaceholder({ user }: { user: User }) {
  const mockTeam = [
    { name: "Ana Paula", role: "colaborador" as const },
    { name: "Carlos Eduardo", role: "colaborador" as const },
    { name: "Marina Costa", role: "lider" as const },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Equipe de {user.department}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockTeam.map((member) => (
            <div
              key={member.name}
              className="flex items-center gap-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{member.name}</p>
              </div>
              <Badge
                variant="outline"
                className={ROLE_COLORS[member.role]}
              >
                {ROLE_LABELS[member.role]}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
