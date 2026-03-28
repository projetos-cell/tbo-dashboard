"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileActivity } from "./profile-activity"
import { UserProjects } from "./user-projects"
import { UserTeam } from "./user-team"
import { ROLE_LABELS, type User } from "../types"
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
