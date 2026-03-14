"use client"

import { IconRoute, IconArrowRight } from "@tabler/icons-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { LearningPath } from "../types"

interface LearningPathCardProps {
  path: LearningPath
}

export function LearningPathCard({ path }: LearningPathCardProps) {
  return (
    <Card className="border-dashed border-2 hover:border-primary/40 transition-colors">
      <CardContent className="p-5 flex items-center gap-5">
        <div className="rounded-xl p-3 bg-primary/10 shrink-0">
          <IconRoute className="size-7 text-primary" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <h3 className="font-semibold text-base">{path.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {path.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Progress value={path.progress} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {path.completedCourses} de {path.totalCourses} cursos
            </span>
          </div>
        </div>

        <Button variant="outline" size="sm" className="shrink-0 gap-1">
          Continuar
          <IconArrowRight className="size-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
