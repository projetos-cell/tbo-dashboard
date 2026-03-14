"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { CourseModule } from "../types"
import { IconCircleCheck, IconPlayerPause, IconPlayerPlay, IconLock } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface CourseModulesListProps {
  modules: CourseModule[]
  completedCount: number
  totalCount: number
  progress: number
  activeModuleId?: string
  onModuleClick?: (mod: CourseModule) => void
}

const STATUS_CONFIG = {
  completed: {
    icon: IconCircleCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    label: "Concluído",
  },
  in_progress: {
    icon: IconPlayerPause,
    color: "text-primary",
    bg: "bg-primary/10",
    label: "Em andamento",
  },
  locked: {
    icon: IconLock,
    color: "text-muted-foreground",
    bg: "bg-muted",
    label: "Bloqueado",
  },
} as const

export function CourseModulesList({
  modules,
  completedCount,
  totalCount,
  progress,
  activeModuleId,
  onModuleClick,
}: CourseModulesListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Conteúdo do Curso</CardTitle>
          <span className="text-sm font-medium text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </CardHeader>
      <CardContent className="space-y-1 p-3 pt-0">
        {modules.map((mod) => {
          const config = STATUS_CONFIG[mod.status]
          const Icon = mod.status === "locked" ? IconLock : mod.status === "completed" ? IconCircleCheck : IconPlayerPlay
          const isActive = mod.id === activeModuleId

          return (
            <button
              key={mod.id}
              onClick={() => mod.status !== "locked" && onModuleClick?.(mod)}
              disabled={mod.status === "locked"}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                mod.status === "locked"
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-muted/50 cursor-pointer",
                isActive && "bg-primary/5 ring-1 ring-primary/20"
              )}
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  config.bg
                )}
              >
                <Icon className={cn("size-4", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{mod.title}</p>
                <p className="text-xs text-muted-foreground">{mod.duration}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {mod.order}/{modules.length}
              </span>
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}
