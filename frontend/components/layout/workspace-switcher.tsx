"use client"

import { IconHome } from "@tabler/icons-react"

export function WorkspaceSwitcher() {
  return (
    <div className="flex w-full items-center gap-2.5 px-2 py-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <IconHome className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">TBO OS</p>
        <p className="text-[11px] text-muted-foreground truncate leading-none">
          Gestão & Operações
        </p>
      </div>
    </div>
  )
}
