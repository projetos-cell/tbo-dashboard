"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  IconCheck,
  IconPlus,
  IconEdit,
  IconTarget,
  IconMessage,
  IconUpload,
  IconCalendar,
  IconStar,
} from "@tabler/icons-react"
import type { User } from "../types"

interface ActivityItem {
  id: string
  icon: typeof IconCheck
  iconColor: string
  text: string
  time: string
}

function getMockActivities(user: User): ActivityItem[] {
  return [
    {
      id: "act-1",
      icon: IconCheck,
      iconColor: "text-green-500",
      text: `Completou tarefa "Revisar proposta comercial"`,
      time: "2h atrás",
    },
    {
      id: "act-2",
      icon: IconPlus,
      iconColor: "text-blue-500",
      text: `Criou projeto "Campanha Q2 - ${user.department}"`,
      time: "5h atrás",
    },
    {
      id: "act-3",
      icon: IconTarget,
      iconColor: "text-purple-500",
      text: `Atualizou OKR "Aumentar taxa de conversão"`,
      time: "1 dia atrás",
    },
    {
      id: "act-4",
      icon: IconMessage,
      iconColor: "text-amber-500",
      text: `Comentou em "Sprint Planning - Semana 12"`,
      time: "1 dia atrás",
    },
    {
      id: "act-5",
      icon: IconEdit,
      iconColor: "text-gray-500",
      text: `Editou documento "Briefing Cliente Alpha"`,
      time: "2 dias atrás",
    },
    {
      id: "act-6",
      icon: IconUpload,
      iconColor: "text-indigo-500",
      text: `Enviou arquivo "apresentacao-final.pdf"`,
      time: "3 dias atrás",
    },
    {
      id: "act-7",
      icon: IconCalendar,
      iconColor: "text-teal-500",
      text: `Participou da reunião "1:1 com líder"`,
      time: "4 dias atrás",
    },
    {
      id: "act-8",
      icon: IconStar,
      iconColor: "text-yellow-500",
      text: `Recebeu reconhecimento "Excelência em Criação"`,
      time: "5 dias atrás",
    },
    {
      id: "act-9",
      icon: IconCheck,
      iconColor: "text-green-500",
      text: `Completou tarefa "Atualizar guidelines da marca"`,
      time: "1 semana atrás",
    },
    {
      id: "act-10",
      icon: IconPlus,
      iconColor: "text-blue-500",
      text: `Adicionou skill "Design System"`,
      time: "1 semana atrás",
    },
  ]
}

interface ProfileActivityProps {
  user: User
  limit?: number
}

export function ProfileActivity({ user, limit }: ProfileActivityProps) {
  const activities = getMockActivities(user)
  const visibleActivities = limit ? activities.slice(0, limit) : activities

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {visibleActivities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <div
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted`}
              >
                <activity.icon
                  className={`h-3.5 w-3.5 ${activity.iconColor}`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">{activity.text}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
