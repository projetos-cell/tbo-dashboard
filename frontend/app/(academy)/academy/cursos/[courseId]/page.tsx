"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { MOCK_COURSES, MOCK_MODULES } from "@/features/courses/data/mock-courses"
import { CourseDetailHeader } from "@/features/courses/components/course-detail-header"
import { CourseVideoPlayer } from "@/features/courses/components/course-video-player"
import { CourseModulesList } from "@/features/courses/components/course-modules-list"
import { CourseAbout } from "@/features/courses/components/course-about"
import type { CourseModule } from "@/features/courses/types"
import { EmptyState } from "@/components/shared"
import { IconSchool } from "@tabler/icons-react"

export default function AcademyCourseDetailPage() {
  const params = useParams<{ courseId: string }>()
  const courseId = params.courseId

  const course = useMemo(
    () => MOCK_COURSES.find((c) => c.id === courseId),
    [courseId]
  )

  const modules = useMemo(
    () =>
      MOCK_MODULES.filter((m) => m.courseId === courseId).sort(
        (a, b) => a.order - b.order
      ),
    [courseId]
  )

  const currentModule = useMemo(
    () => modules.find((m) => m.status === "in_progress") ?? modules[0],
    [modules]
  )

  const [activeModule, setActiveModule] = useState<CourseModule | undefined>(
    currentModule
  )

  if (!course) {
    return (
      <EmptyState
        icon={IconSchool}
        title="Curso não encontrado"
        description="O curso que você está procurando não existe ou foi removido."
        cta={{ label: "Voltar para Academy", onClick: () => window.history.back() }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <CourseDetailHeader course={course} backHref="/academy/explorar" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CourseVideoPlayer
            category={course.category}
            currentModuleTitle={activeModule?.title ?? course.title}
          />
          <CourseAbout course={course} />
        </div>

        <div className="lg:col-span-1">
          <CourseModulesList
            modules={modules}
            completedCount={course.completedModules}
            totalCount={course.totalModules}
            progress={course.progress}
            activeModuleId={activeModule?.id}
            onModuleClick={setActiveModule}
          />
        </div>
      </div>
    </div>
  )
}
