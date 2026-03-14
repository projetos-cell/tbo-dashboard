"use client"

import { useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/shared/page-header"
import { CourseCard } from "@/features/courses/components/course-card"
import { EmptyState } from "@/components/shared"
import { MOCK_COURSES } from "@/features/courses/data/mock-courses"
import { IconBook2 } from "@tabler/icons-react"

export default function MeusCursosPage() {
  const inProgress = useMemo(
    () => MOCK_COURSES.filter((c) => c.status === "em_andamento"),
    []
  )
  const completed = useMemo(
    () => MOCK_COURSES.filter((c) => c.status === "concluido"),
    []
  )
  const notStarted = useMemo(
    () => MOCK_COURSES.filter((c) => c.status === "nao_iniciado"),
    []
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meus Cursos"
        description="Acompanhe seu progresso em todos os cursos"
      />

      <Tabs defaultValue="em_andamento" className="space-y-6">
        <TabsList>
          <TabsTrigger value="em_andamento">
            Em Andamento ({inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="concluidos">
            Concluídos ({completed.length})
          </TabsTrigger>
          <TabsTrigger value="salvos">
            Salvos ({notStarted.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="em_andamento">
          {inProgress.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inProgress.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={IconBook2}
              title="Nenhum curso em andamento"
              description="Explore nosso catálogo e comece a aprender."
            />
          )}
        </TabsContent>

        <TabsContent value="concluidos">
          {completed.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {completed.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={IconBook2}
              title="Nenhum curso concluído ainda"
              description="Continue aprendendo para conquistar seu primeiro certificado."
            />
          )}
        </TabsContent>

        <TabsContent value="salvos">
          {notStarted.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {notStarted.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={IconBook2}
              title="Nenhum curso salvo"
              description="Salve cursos para assistir depois."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
