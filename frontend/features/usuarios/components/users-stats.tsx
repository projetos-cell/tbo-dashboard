"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  IconUsers,
  IconUserCheck,
  IconUserOff,
  IconUserX,
} from "@tabler/icons-react"
import type { User } from "../types"

interface UsersStatsProps {
  users: User[]
}

export function UsersStats({ users }: UsersStatsProps) {
  const total = users.length
  const ativos = users.filter((u) => u.status === "ativo").length
  const inativos = users.filter((u) => u.status === "inativo").length
  const suspensos = users.filter((u) => u.status === "suspenso").length

  const pct = (value: number) =>
    total > 0 ? `${Math.round((value / total) * 100)}%` : "0%"

  const cards = [
    {
      label: "Total Usuários",
      value: total,
      pct: "100%",
      icon: IconUsers,
      iconColor: "text-gray-600",
      iconBg: "bg-gray-100",
    },
    {
      label: "Ativos",
      value: ativos,
      pct: pct(ativos),
      icon: IconUserCheck,
      iconColor: "text-green-600",
      iconBg: "bg-green-50",
    },
    {
      label: "Inativos",
      value: inativos,
      pct: pct(inativos),
      icon: IconUserOff,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-50",
    },
    {
      label: "Suspensos",
      value: suspensos,
      pct: pct(suspensos),
      icon: IconUserX,
      iconColor: "text-red-600",
      iconBg: "bg-red-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center gap-4 p-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}
            >
              <card.icon className={`h-5 w-5 ${card.iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{card.value}</p>
                <span className="text-xs text-muted-foreground">
                  {card.pct}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
