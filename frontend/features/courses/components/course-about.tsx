"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Course } from "../types"
import { IconTarget, IconBulb, IconCertificate } from "@tabler/icons-react"

interface CourseAboutProps {
  course: Course
}

const TARGET_AUDIENCE: Record<string, string[]> = {
  Design: ["Designers iniciantes", "Profissionais de marketing", "Empreendedores"],
  Branding: ["Gestores de marca", "Diretores criativos", "Estrategistas"],
  "Marketing Digital": ["Analistas de marketing", "Gestores de tráfego", "Empreendedores"],
  Copywriting: ["Redatores", "Social media managers", "Profissionais de marketing"],
  "Motion Graphics": ["Designers gráficos", "Editores de vídeo", "Content creators"],
  "UI/UX": ["Designers", "Product managers", "Desenvolvedores frontend"],
  "Social Media": ["Social media managers", "Analistas de conteúdo", "Freelancers"],
  Gestao: ["Gerentes de projeto", "Líderes de equipe", "Coordenadores"],
}

export function CourseAbout({ course }: CourseAboutProps) {
  const audience = TARGET_AUDIENCE[course.category] ?? ["Profissionais da área criativa"]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <IconBulb className="size-4 text-amber-500" />
            Sobre este Curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {course.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {course.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <IconTarget className="size-4 text-blue-500" />
            Para quem é este curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {audience.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="size-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <IconCertificate className="size-4 text-emerald-500" />
            Certificado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Ao concluir todos os módulos, você receberá um certificado de conclusão
            que poderá ser compartilhado no seu perfil profissional.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
