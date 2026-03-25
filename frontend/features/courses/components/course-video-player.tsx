"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconPlayerPlay, IconVideo } from "@tabler/icons-react"
import { toast } from "sonner"

const CATEGORY_GRADIENTS: Record<string, string> = {
  Design: "from-[#b8f724] to-emerald-600",
  Branding: "from-amber-500 to-orange-600",
  "Marketing Digital": "from-blue-500 to-cyan-600",
  Copywriting: "from-emerald-500 to-teal-600",
  "Motion Graphics": "from-pink-500 to-rose-600",
  "UI/UX": "from-teal-500 to-cyan-600",
  "Social Media": "from-pink-500 to-rose-600",
  Gestao: "from-slate-500 to-gray-600",
}

interface CourseVideoPlayerProps {
  category: string
  currentModuleTitle: string
}

export function CourseVideoPlayer({ category, currentModuleTitle }: CourseVideoPlayerProps) {
  const [clicked, setClicked] = useState(false)
  const gradient = CATEGORY_GRADIENTS[category] ?? "from-gray-500 to-gray-600"

  const handlePlay = () => {
    setClicked(true)
    toast.info("Conteúdo de vídeo em breve", {
      description: "Os cursos serão disponibilizados na próxima fase da plataforma.",
    })
  }

  return (
    <Card className="overflow-hidden border-0">
      <div
        className={`relative flex aspect-video items-center justify-center bg-gradient-to-br ${gradient}`}
      >
        <div className="absolute inset-0 bg-black/20" />

        {clicked ? (
          <div className="relative z-10 flex flex-col items-center gap-3 text-center px-8">
            <IconVideo className="size-12 text-white/70" />
            <p className="text-white font-semibold text-lg">Conteúdo em breve</p>
            <p className="text-white/70 text-sm max-w-xs">
              Os vídeos serão integrados na próxima fase da plataforma.
            </p>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">
              Em desenvolvimento
            </Badge>
          </div>
        ) : (
          <Button
            size="lg"
            className="relative z-10 size-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all hover:scale-105"
            onClick={handlePlay}
          >
            <IconPlayerPlay className="size-8 text-white fill-white" />
          </Button>
        )}

        <div className="absolute bottom-4 left-4 z-10">
          <p className="text-sm text-white/80">Módulo atual</p>
          <p className="text-lg font-semibold text-white">{currentModuleTitle}</p>
        </div>
      </div>
    </Card>
  )
}
