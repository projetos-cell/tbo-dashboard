"use client"

import { useState, useMemo } from "react"
import { IconPlus } from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { CourseStatsCards } from "@/features/courses/components/course-stats-cards"
import { CourseCard } from "@/features/courses/components/course-card"
import { LearningPathCard } from "@/features/courses/components/learning-path-card"
import { LeaderboardCard } from "@/features/courses/components/leaderboard-card"
import { CoursesFilters } from "@/features/courses/components/courses-filters"
import {
  MOCK_COURSES,
  MOCK_LEARNING_PATHS,
  MOCK_LEADERBOARD,
  COURSE_CATEGORIES,
} from "@/features/courses/data/mock-courses"
import type { CourseStatus } from "@/features/courses/types"

type StatusFilter = CourseStatus | "todos"

export default function CursosPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("todos")
  const [level, setLevel] = useState("todos")
  const [status, setStatus] = useState<StatusFilter>("todos")

  const filteredCourses = useMemo(() => {
    return MOCK_COURSES.filter((course) => {
      if (
        search &&
        !course.title.toLowerCase().includes(search.toLowerCase()) &&
        !course.instructor.toLowerCase().includes(search.toLowerCase())
      ) {
        return false
      }
      if (category !== "todos" && course.category !== category) return false
      if (level !== "todos" && course.level !== level) return false
      if (status !== "todos" && course.status !== status) return false
      return true
    })
  }, [search, category, level, status])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const course of MOCK_COURSES) {
      counts[course.category] = (counts[course.category] ?? 0) + 1
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [])

  const featuredPath = MOCK_LEARNING_PATHS[0]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academia TBO"
        description="Desenvolva suas habilidades e acelere sua carreira criativa"
        actions={
          <Button size="sm" className="gap-1">
            <IconPlus className="size-4" />
            Novo Curso
          </Button>
        }
      />

      <CourseStatsCards courses={MOCK_COURSES} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured learning path */}
          {featuredPath && <LearningPathCard path={featuredPath} />}

          {/* Learning paths secondary */}
          {MOCK_LEARNING_PATHS.length > 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {MOCK_LEARNING_PATHS.slice(1).map((path) => (
                <LearningPathCard key={path.id} path={path} />
              ))}
            </div>
          )}

          {/* Filters */}
          <CoursesFilters
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            level={level}
            onLevelChange={setLevel}
            status={status}
            onStatusChange={setStatus}
          />

          {/* Course grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Nenhum curso encontrado com os filtros selecionados.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    setSearch("")
                    setCategory("todos")
                    setLevel("todos")
                    setStatus("todos")
                  }}
                >
                  Limpar filtros
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <LeaderboardCard entries={MOCK_LEADERBOARD} />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Categorias Populares
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categoryCounts.map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="w-full flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors text-sm"
                >
                  <span>{cat}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {count}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
