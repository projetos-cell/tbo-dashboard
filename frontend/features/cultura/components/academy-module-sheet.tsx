"use client"

import { useState, useEffect } from "react"
import {
  IconArrowRight,
  IconArrowLeft,
  IconCheck,
  IconBook,
  IconQuestionMark,
  IconBulb,
  IconTarget,
} from "@tabler/icons-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import type { AcademyModule } from "@/features/cultura/data/cultura-notion-seed"

const SECTION_TYPE_CONFIG: Record<
  "read" | "quiz" | "reflection" | "action",
  { icon: React.ElementType; label: string; color: string; prompt: string }
> = {
  read: {
    icon: IconBook,
    label: "Leitura",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40",
    prompt:
      "Leia com atenção e reflita sobre como este conteúdo se aplica ao seu trabalho na TBO. O conteúdo completo está disponível no Manual de Cultura.",
  },
  quiz: {
    icon: IconQuestionMark,
    label: "Quiz",
    color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40",
    prompt:
      "Responda as perguntas do quiz para validar seu entendimento. O objetivo é consolidar o aprendizado antes de avançar.",
  },
  reflection: {
    icon: IconBulb,
    label: "Reflexão",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
    prompt:
      "Reserve um momento para refletir. Não há resposta certa ou errada — o objetivo é internalizar o conteúdo e conectá-lo à sua rotina.",
  },
  action: {
    icon: IconTarget,
    label: "Ação",
    color: "text-green-600 bg-green-50 dark:bg-green-950/40",
    prompt:
      "Complete a ação descrita. Esta é uma atividade prática que reforça o aprendizado e cria impacto real no time.",
  },
}

interface AcademyModuleSheetProps {
  module: AcademyModule | null
  onComplete: (moduleId: string) => void
  onClose: () => void
}

export function AcademyModuleSheet({
  module,
  onComplete,
  onClose,
}: AcademyModuleSheetProps) {
  const [sectionIdx, setSectionIdx] = useState(0)

  // Reset section index when module changes
  useEffect(() => {
    setSectionIdx(0)
  }, [module?.id])

  if (!module) return null

  const currentSection = module.sections[sectionIdx]
  const isLastSection = sectionIdx === module.sections.length - 1
  const progressPct = Math.round(((sectionIdx + 1) / module.sections.length) * 100)
  const config = SECTION_TYPE_CONFIG[currentSection.type]
  const TypeIcon = config.icon

  const handleComplete = () => {
    onComplete(module.id)
    onClose()
  }

  return (
    <Sheet open={!!module} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col overflow-y-auto">
        <SheetHeader className="shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base">
            <span>{module.emoji}</span>
            <span>{module.title}</span>
            {module.requiredForOnboarding && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">
                Obrigatório
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription className="text-xs">{module.description}</SheetDescription>
        </SheetHeader>

        {/* Section progress */}
        <div className="mt-4 space-y-1.5 shrink-0">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              Seção {sectionIdx + 1} de {module.sections.length}
            </span>
            <span>{progressPct}% concluído</span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>

        {/* Section list pills */}
        <div className="mt-3 flex flex-wrap gap-1 shrink-0">
          {module.sections.map((sec, idx) => (
            <button
              key={sec.id}
              onClick={() => setSectionIdx(idx)}
              className={`rounded-full px-2.5 py-0.5 text-xs transition-colors border ${
                idx === sectionIdx
                  ? "border-primary bg-primary text-primary-foreground"
                  : idx < sectionIdx
                    ? "border-green-400/40 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                    : "border-muted bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              {idx < sectionIdx ? <IconCheck className="inline size-2.5 mr-0.5" /> : null}
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Section content */}
        <div className="mt-6 flex-1 space-y-4">
          <div className={`flex items-center gap-2 rounded-lg p-3 ${config.color}`}>
            <TypeIcon className="size-4 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wide">{config.label}</span>
          </div>

          <h3 className="text-lg font-semibold leading-tight">{currentSection.title}</h3>

          <Card className="border-dashed">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{config.prompt}</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center gap-2 shrink-0 border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSectionIdx((i) => i - 1)}
            disabled={sectionIdx === 0}
            className="gap-1"
          >
            <IconArrowLeft className="size-3.5" />
            Anterior
          </Button>

          {isLastSection ? (
            <Button size="sm" onClick={handleComplete} className="ml-auto gap-1">
              <IconCheck className="size-3.5" />
              Concluir módulo
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setSectionIdx((i) => i + 1)}
              className="ml-auto gap-1"
            >
              Próxima seção
              <IconArrowRight className="size-3.5" />
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
