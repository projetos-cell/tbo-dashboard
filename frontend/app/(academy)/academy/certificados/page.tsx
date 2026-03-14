"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared"
import { MOCK_COURSES } from "@/features/courses/data/mock-courses"
import {
  IconCertificate,
  IconDownload,
  IconShare,
  IconCalendar,
} from "@tabler/icons-react"

export default function CertificadosPage() {
  const completedCourses = useMemo(
    () => MOCK_COURSES.filter((c) => c.status === "concluido"),
    []
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificados"
        description="Certificados conquistados ao concluir cursos"
      />

      {completedCourses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {completedCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden group">
              {/* Certificate visual */}
              <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-6 border-b flex flex-col items-center text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-2xl mb-3">
                  <IconCertificate className="size-8" />
                </div>
                <h3 className="font-semibold text-sm">{course.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {course.instructor}
                </p>
              </div>

              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <IconCalendar className="size-3" />
                    Concluído em Mar 2026
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {course.category}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <IconDownload className="size-3" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <IconShare className="size-3" />
                    Compartilhar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={IconCertificate}
          title="Nenhum certificado ainda"
          description="Conclua um curso completo para receber seu primeiro certificado."
        />
      )}
    </div>
  )
}
