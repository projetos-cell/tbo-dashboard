"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { CourseCard } from "@/features/courses/components/course-card"
import { CourseStatsCards } from "@/features/courses/components/course-stats-cards"
import { CoursesFilters } from "@/features/courses/components/courses-filters"
import { MOCK_COURSES, COURSE_CATEGORIES } from "@/features/courses/data/mock-courses"
import type { CourseStatus } from "@/features/courses/types"

type StatusFilter = CourseStatus | "todos"

export default function ExplorarCursosPage() {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Explorar Cursos"
        description="Descubra novos cursos e amplie suas habilidades criativas"
      />

      <CourseStatsCards courses={MOCK_COURSES} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar filters */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <p className="text-sm font-medium mb-3">Categorias</p>
              <button
                onClick={() => setCategory("todos")}
                className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors text-sm ${category === "todos" ? "bg-muted font-medium" : ""}`}
              >
                <span>Todas</span>
                <Badge variant="secondary" className="text-[10px]">
                  {MOCK_COURSES.length}
                </Badge>
              </button>
              {categoryCounts.map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors text-sm ${category === cat ? "bg-muted font-medium" : ""}`}
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

        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
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

          {filteredCourses.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
      </div>
    </div>
  )
}
