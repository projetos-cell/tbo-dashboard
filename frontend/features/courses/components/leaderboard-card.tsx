"use client"

import { IconTrophy } from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { LeaderboardEntry } from "../types"

interface LeaderboardCardProps {
  entries: LeaderboardEntry[]
}

const RANK_STYLES: Record<number, string> = {
  1: "text-amber-500 font-bold",
  2: "text-gray-400 font-bold",
  3: "text-orange-600 font-bold",
}

const RANK_BG: Record<number, string> = {
  1: "ring-2 ring-amber-400",
  2: "ring-2 ring-gray-300",
  3: "ring-2 ring-orange-400",
}

export function LeaderboardCard({ entries }: LeaderboardCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <IconTrophy className="size-4 text-amber-500" />
          Top Aprendizes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-3 py-1"
          >
            <span
              className={`w-5 text-center text-sm ${RANK_STYLES[entry.rank] ?? "text-muted-foreground"}`}
            >
              {entry.rank}
            </span>

            <Avatar
              className={`size-8 ${RANK_BG[entry.rank] ?? ""}`}
            >
              <AvatarFallback className="text-xs">
                {entry.avatar}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{entry.name}</p>
            </div>

            <span className="text-xs font-semibold text-muted-foreground">
              {entry.points.toLocaleString("pt-BR")} pts
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
