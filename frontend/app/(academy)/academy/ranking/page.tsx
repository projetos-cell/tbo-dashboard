"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/shared/page-header"
import { MOCK_LEADERBOARD } from "@/features/courses/data/mock-courses"
import {
  IconTrophy,
  IconMedal,
  IconFlame,
  IconTarget,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"

const RANK_CONFIG = [
  { color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-950/30", icon: "🥇" },
  { color: "text-gray-400", bg: "bg-gray-100 dark:bg-gray-950/30", icon: "🥈" },
  { color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-950/30", icon: "🥉" },
]

export default function RankingPage() {
  const topThree = MOCK_LEADERBOARD.slice(0, 3)
  const rest = MOCK_LEADERBOARD.slice(3)
  const maxPoints = MOCK_LEADERBOARD[0]?.points ?? 1

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ranking"
        description="Os maiores aprendizes da TBO Academy"
      />

      {/* Podium */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 0, 2].map((idx) => {
          const entry = topThree[idx]
          if (!entry) return <div key={idx} />
          const config = RANK_CONFIG[idx]
          const isFirst = idx === 0

          return (
            <Card
              key={entry.id}
              className={cn(
                "text-center",
                isFirst && "ring-2 ring-amber-400/50 -mt-4"
              )}
            >
              <CardContent className="p-6 flex flex-col items-center">
                <span className="text-3xl mb-2">{config?.icon}</span>
                <Avatar className={cn("size-16 mb-2", isFirst && "size-20")}>
                  <AvatarFallback className="text-lg font-bold">
                    {entry.avatar}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">{entry.name}</h3>
                <p className="text-2xl font-bold mt-1">
                  {entry.points.toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-muted-foreground">pontos</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Full list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <IconTrophy className="size-4 text-amber-500" />
            Classificação Completa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {MOCK_LEADERBOARD.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-4 rounded-lg p-3 hover:bg-muted/50 transition-colors"
            >
              <span className="w-6 text-center text-sm font-bold text-muted-foreground">
                {entry.rank}
              </span>
              <Avatar>
                <AvatarFallback>{entry.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{entry.name}</p>
                <Progress
                  value={(entry.points / maxPoints) * 100}
                  className="h-1.5 mt-1"
                />
              </div>
              <Badge variant="secondary" className="shrink-0">
                {entry.points.toLocaleString("pt-BR")} pts
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#b8f724]/10 dark:bg-[#b8f724]/10">
              <IconMedal className="size-5 text-[#b8f724]" />
            </div>
            <div>
              <p className="text-sm font-medium">Sua posição</p>
              <p className="text-xs text-muted-foreground">#4 no ranking geral</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/30">
              <IconFlame className="size-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Sequência atual</p>
              <p className="text-xs text-muted-foreground">12 dias seguidos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/30">
              <IconTarget className="size-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Meta semanal</p>
              <p className="text-xs text-muted-foreground">3/5 módulos concluídos</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
