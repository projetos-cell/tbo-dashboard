"use client"

import {
  IconSchool,
  IconPlayerPlay,
  IconCircleCheck,
  IconClock,
} from "@tabler/icons-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Course } from "../types"

interface CourseStatsCardsProps {
  courses: Course[]
}

interface StatItem {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
  bgColor: string
}

export function CourseStatsCards({ courses }: CourseStatsCardsProps) {
  const totalCourses = courses.length
  const inProgress = courses.filter((c) => c.status === "em_andamento").length
  const completed = courses.filter((c) => c.status === "concluido").length

  const totalHours = courses.reduce((acc, c) => {
    const match = c.duration.match(/(\d+)h/)
    return acc + (match ? parseInt(match[1], 10) : 0)
  }, 0)

  const stats: StatItem[] = [
    {
      label: "Total de Cursos",
      value: totalCourses,
      icon: IconSchool,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Em Andamento",
      value: inProgress,
      icon: IconPlayerPlay,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Concluidos",
      value: completed,
      icon: IconCircleCheck,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Horas de Aprendizado",
      value: `${totalHours}h`,
      icon: IconClock,
      color: "text-[#b8f724]",
      bgColor: "bg-[#b8f724]/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`rounded-lg p-2.5 ${stat.bgColor}`}>
                <Icon className={`size-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
