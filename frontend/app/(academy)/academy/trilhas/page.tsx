"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/shared/page-header"
import { CourseCard } from "@/features/courses/components/course-card"
import {
  MOCK_COURSES,
  MOCK_LEARNING_PATHS,
} from "@/features/courses/data/mock-courses"
import {
  IconRoute,
  IconBook2,
  IconTarget,
  IconArrowRight,
} from "@tabler/icons-react"

const PATH_COURSE_IDS: Record<string, string[]> = {
  lp1: ["c1", "c5", "c6", "c4"],
  lp2: ["c2", "c3", "c7", "c8"],
}

export default function TrilhasPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Trilhas de Aprendizado"
        description="Caminhos estruturados para desenvolver competências completas"
      />

      {MOCK_LEARNING_PATHS.map((path) => {
        const courseIds = PATH_COURSE_IDS[path.id] ?? []
        const courses = courseIds
          .map((id) => MOCK_COURSES.find((c) => c.id === id))
          .filter(Boolean)

        return (
          <div key={path.id} className="space-y-4">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-[#b8f724]/10 to-[#0a1f1d]/10 p-6 border-b">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <IconRoute className="size-5 text-[#b8f724]" />
                      <h2 className="text-lg font-semibold">{path.title}</h2>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-lg">
                      {path.description}
                    </p>
                    <div className="flex items-center gap-4 pt-1">
                      <Badge variant="secondary" className="gap-1">
                        <IconBook2 className="size-3" />
                        {path.totalCourses} cursos
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <IconTarget className="size-3" />
                        {path.completedCourses} concluídos
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold">{path.progress}%</p>
                    <Progress
                      value={path.progress}
                      className="h-2 w-32 mt-1"
                    />
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {courses.map((course, idx) =>
                    course ? (
                      <div key={course.id} className="relative">
                        {idx > 0 && (
                          <div className="absolute -left-2 top-1/2 -translate-y-1/2 hidden lg:block">
                            <IconArrowRight className="size-4 text-muted-foreground" />
                          </div>
                        )}
                        <CourseCard course={course} />
                      </div>
                    ) : null
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
