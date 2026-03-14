"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconPlayerPlay } from "@tabler/icons-react"

const CATEGORY_GRADIENTS: Record<string, string> = {
  Design: "from-violet-500 to-purple-600",
  Branding: "from-amber-500 to-orange-600",
  "Marketing Digital": "from-blue-500 to-cyan-600",
  Copywriting: "from-emerald-500 to-teal-600",
  "Motion Graphics": "from-pink-500 to-rose-600",
  "UI/UX": "from-indigo-500 to-blue-600",
  "Social Media": "from-fuchsia-500 to-purple-600",
  Gestao: "from-slate-500 to-gray-600",
}

interface CourseVideoPlayerProps {
  category: string
  currentModuleTitle: string
}

export function CourseVideoPlayer({ category, currentModuleTitle }: CourseVideoPlayerProps) {
  const gradient = CATEGORY_GRADIENTS[category] ?? "from-gray-500 to-gray-600"

  return (
    <Card className="overflow-hidden border-0">
      <div
        className={`relative flex aspect-video items-center justify-center bg-gradient-to-br ${gradient}`}
      >
        <div className="absolute inset-0 bg-black/20" />
        <Button
          size="lg"
          className="relative z-10 size-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
        >
          <IconPlayerPlay className="size-8 text-white fill-white" />
        </Button>
        <div className="absolute bottom-4 left-4 z-10">
          <p className="text-sm text-white/80">Reproduzindo</p>
          <p className="text-lg font-semibold text-white">{currentModuleTitle}</p>
        </div>
      </div>
    </Card>
  )
}
