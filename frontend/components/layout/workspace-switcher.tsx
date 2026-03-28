"use client"

import { cn } from "@/lib/utils"

export function WorkspaceSwitcher() {
  return (
    <div className="flex w-full items-center gap-3 px-3 py-3">
      {/* Logo mark with gradient */}
      <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-sm shadow-primary/20">
        <span className="text-sm font-black tracking-tight text-primary-foreground">
          T
        </span>
        {/* Subtle shine overlay */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold tracking-tight truncate">
          <span className="font-bold">TBO</span>
          <span className="font-light text-muted-foreground ml-1">OS</span>
        </p>
        <p className="text-[10px] text-muted-foreground/70 truncate leading-none mt-0.5">
          Gestão & Operações
        </p>
      </div>
    </div>
  )
}
