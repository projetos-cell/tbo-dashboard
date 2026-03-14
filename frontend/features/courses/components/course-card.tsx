"use client"

import {
  IconBrush,
  IconBulb,
  IconSpeakerphone,
  IconPencil,
  IconVideo,
  IconLayout,
  IconBrandInstagram,
  IconClipboardList,
  IconStar,
  IconClock,
  IconBooks,
} from "@tabler/icons-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { Course } from "../types"

interface CourseCardProps {
  course: Course
  basePath?: string
}

const CATEGORY_CONFIG: Record<
  string,
  { icon: React.ElementType; gradient: string }
> = {
  Design: { icon: IconBrush, gradient: "from-pink-500 to-rose-600" },
  Branding: { icon: IconBulb, gradient: "from-violet-500 to-purple-600" },
  "Marketing Digital": {
    icon: IconSpeakerphone,
    gradient: "from-blue-500 to-cyan-600",
  },
  Copywriting: { icon: IconPencil, gradient: "from-amber-500 to-orange-600" },
  "Motion Graphics": {
    icon: IconVideo,
    gradient: "from-emerald-500 to-teal-600",
  },
  "UI/UX": { icon: IconLayout, gradient: "from-indigo-500 to-blue-600" },
  "Social Media": {
    icon: IconBrandInstagram,
    gradient: "from-pink-500 to-fuchsia-600",
  },
  Gestao: {
    icon: IconClipboardList,
    gradient: "from-slate-500 to-gray-600",
  },
}

const LEVEL_LABELS: Record<string, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediario",
  avancado: "Avancado",
}

const LEVEL_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  iniciante: "secondary",
  intermediario: "default",
  avancado: "outline",
}

export function CourseCard({ course, basePath = "/academy/cursos" }: CourseCardProps) {
  const config = CATEGORY_CONFIG[course.category] ?? {
    icon: IconBooks,
    gradient: "from-gray-500 to-gray-600",
  }
  const Icon = config.icon

  const buttonLabel =
    course.status === "concluido"
      ? "Revisar"
      : course.status === "em_andamento"
        ? "Continuar"
        : "Iniciar"

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group">
      {/* Thumbnail */}
      <div
        className={`h-32 bg-gradient-to-br ${config.gradient} flex items-center justify-center relative`}
      >
        <Icon className="size-12 text-white/80" />
        <Badge className="absolute top-2 left-2 bg-white/20 text-white border-0 text-[10px]">
          {course.category}
        </Badge>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {course.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {course.instructor}
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-1.5" />
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <IconClock className="size-3" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <IconBooks className="size-3" />
            {course.completedModules}/{course.totalModules} modulos
          </span>
        </div>

        {/* Rating + Level */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs">
            <IconStar className="size-3.5 text-amber-500 fill-amber-500" />
            <span className="font-medium">{course.rating}</span>
            <span className="text-muted-foreground">
              ({course.students})
            </span>
          </span>
          <Badge variant={LEVEL_VARIANTS[course.level]}>
            {LEVEL_LABELS[course.level]}
          </Badge>
        </div>

        <Button
          size="sm"
          className="w-full"
          variant={course.status === "concluido" ? "outline" : "default"}
          asChild
        >
          <Link href={`${basePath}/${course.id}`}>
            {buttonLabel}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
