"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  IconBook2,
  IconFlame,
  IconClock,
  IconTrophy,
  IconArrowRight,
  IconPlayerPlay,
  IconStar,
} from "@tabler/icons-react"
import { CourseCard } from "@/features/courses/components/course-card"
import { LeaderboardCard } from "@/features/courses/components/leaderboard-card"
import {
  MOCK_COURSES,
  MOCK_LEARNING_PATHS,
  MOCK_LEADERBOARD,
} from "@/features/courses/data/mock-courses"

export default function AcademyDashboardPage() {
  const inProgressCourses = useMemo(
    () => MOCK_COURSES.filter((c) => c.status === "em_andamento"),
    []
  )

  const totalHours = useMemo(() => {
    const completed = MOCK_COURSES.filter((c) => c.status === "concluido")
    return completed.reduce((acc, c) => {
      const match = c.duration.match(/(\d+)h/)
      return acc + (match ? parseInt(match[1], 10) : 0)
    }, 0)
  }, [])

  const streak = 12 // mock streak

  return (
    <div className="space-y-6">
      {/* Welcome hero */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0a1f1d] via-[#0d2e2b] to-[#112e1e] p-6 text-white md:p-8">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
              <IconFlame className="size-3 mr-1" />
              {streak} dias seguidos
            </Badge>
            <h1 className="text-2xl font-bold md:text-3xl">
              Bem-vindo à TBO Academy
            </h1>
            <p className="max-w-lg text-sm text-white/80">
              Continue de onde parou. Você está a caminho de dominar novas
              habilidades criativas.
            </p>
          </div>
          <div className="flex gap-3">
            {inProgressCourses[0] && (
              <Button
                asChild
                className="bg-[#b8f724] text-[#0a1f1d] hover:bg-[#b8f724]/90"
              >
                <Link href={`/academy/cursos/${inProgressCourses[0].id}`}>
                  <IconPlayerPlay className="size-4 mr-1" />
                  Continuar aprendendo
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#b8f724]/10 dark:bg-[#b8f724]/10">
                <IconBook2 className="size-5 text-[#b8f724]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressCourses.length}</p>
                <p className="text-xs text-muted-foreground">Em andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/30">
                <IconTrophy className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {MOCK_COURSES.filter((c) => c.status === "concluido").length}
                </p>
                <p className="text-xs text-muted-foreground">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/30">
                <IconClock className="size-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalHours}h</p>
                <p className="text-xs text-muted-foreground">Horas de estudo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/30">
                <IconFlame className="size-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{streak}</p>
                <p className="text-xs text-muted-foreground">Dias de sequência</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue learning + sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Continue where you left off */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Continuar aprendendo</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/academy/meus-cursos">
                Ver todos
                <IconArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {inProgressCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                basePath="/academy/cursos"
              />
            ))}
          </div>

          {/* Learning paths */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Trilhas de aprendizado</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/academy/trilhas">
                Ver trilhas
                <IconArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>

          {MOCK_LEARNING_PATHS.map((path) => (
            <Card key={path.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold">{path.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {path.description}
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                      <span className="text-xs text-muted-foreground">
                        {path.completedCourses}/{path.totalCourses} cursos
                      </span>
                      <Progress value={path.progress} className="h-1.5 flex-1 max-w-[200px]" />
                      <span className="text-xs font-medium">{path.progress}%</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Continuar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <LeaderboardCard entries={MOCK_LEADERBOARD} />

          {/* Recent achievement */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <IconStar className="size-4 text-amber-500" />
                Última conquista
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-lg">
                  🏆
                </div>
                <div>
                  <p className="text-sm font-medium">Branding Master</p>
                  <p className="text-xs text-muted-foreground">
                    Concluiu o curso de Branding Estratégico
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommended */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Recomendado para você
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_COURSES.filter((c) => c.status === "nao_iniciado")
                .slice(0, 3)
                .map((course) => (
                  <Link
                    key={course.id}
                    href={`/academy/cursos/${course.id}`}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <IconBook2 className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {course.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {course.duration} · {course.instructor}
                      </p>
                    </div>
                  </Link>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
