"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import type { Course } from "../types"
import {
  IconArrowLeft,
  IconShare,
  IconBookmark,
  IconBookmarkFilled,
  IconStar,
  IconUsers,
  IconClock,
} from "@tabler/icons-react"
import Link from "next/link"

const LEVEL_LABELS: Record<string, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
}

interface CourseDetailHeaderProps {
  course: Course
  backHref?: string
}

export function CourseDetailHeader({ course, backHref = "/academy/explorar" }: CourseDetailHeaderProps) {
  const [bookmarked, setBookmarked] = useState(false)

  const initials = course.instructor
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Link copiado para a área de transferência")
    } catch {
      toast.error("Não foi possível copiar o link")
    }
  }, [])

  const handleBookmark = useCallback(() => {
    setBookmarked((prev) => !prev)
    toast.success(bookmarked ? "Curso removido dos salvos" : "Curso salvo com sucesso")
  }, [bookmarked])

  return (
    <div className="space-y-4">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <IconArrowLeft className="size-4" />
        Voltar para cursos
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{course.category}</Badge>
            <Badge variant="outline">{LEVEL_LABELS[course.level]}</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
          <p className="text-muted-foreground max-w-2xl">{course.description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <IconShare className="size-4 mr-1" />
            Compartilhar
          </Button>
          <Button
            variant={bookmarked ? "default" : "outline"}
            size="sm"
            onClick={handleBookmark}
          >
            {bookmarked ? (
              <IconBookmarkFilled className="size-4 mr-1" />
            ) : (
              <IconBookmark className="size-4 mr-1" />
            )}
            {bookmarked ? "Salvo" : "Salvar"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span>{course.instructor}</span>
        </div>
        <div className="flex items-center gap-1">
          <IconStar className="size-4 text-amber-500 fill-amber-500" />
          <span className="font-medium text-foreground">{course.rating}</span>
        </div>
        <div className="flex items-center gap-1">
          <IconUsers className="size-4" />
          <span>{course.students} alunos</span>
        </div>
        <div className="flex items-center gap-1">
          <IconClock className="size-4" />
          <span>{course.duration}</span>
        </div>
      </div>
    </div>
  )
}
