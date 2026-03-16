"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import {
  IconCheck,
  IconChevronDown,
  IconSchool,
  IconHome,
} from "@tabler/icons-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  WORKSPACES,
  useWorkspaceStore,
  type WorkspaceId,
} from "@/stores/workspace-store"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import { canAccessModule, type RoleSlug } from "@/lib/permissions"

const WORKSPACE_ICONS: Record<WorkspaceId, React.ElementType> = {
  "tbo-os": IconHome,
  "tbo-academy": IconSchool,
}

export function WorkspaceSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace)
  const role = useAuthStore((s) => s.role) as RoleSlug | null

  // Filter workspaces based on role permissions
  const visibleWorkspaces = WORKSPACES.filter((ws) => {
    if (ws.id === "tbo-academy") {
      return role ? canAccessModule(role, "academy") : false
    }
    return true
  })

  // Sync store with current route
  useEffect(() => {
    if (pathname.startsWith("/academy")) {
      if (activeWorkspace !== "tbo-academy") setActiveWorkspace("tbo-academy")
    } else {
      if (activeWorkspace !== "tbo-os") setActiveWorkspace("tbo-os")
    }
  }, [pathname, activeWorkspace, setActiveWorkspace])

  const current = WORKSPACES.find((w) => w.id === activeWorkspace) ?? WORKSPACES[0]
  const CurrentIcon = WORKSPACE_ICONS[current.id]

  const handleSwitch = (ws: (typeof WORKSPACES)[number]) => {
    setActiveWorkspace(ws.id)
    router.push(ws.href)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left",
            "transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              current.id === "tbo-academy"
                ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white"
                : "bg-primary text-primary-foreground"
            )}
          >
            <CurrentIcon className="size-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{current.label}</p>
            <p className="text-[11px] text-muted-foreground truncate leading-none">
              {current.description}
            </p>
          </div>
          <IconChevronDown className="size-4 text-muted-foreground shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64" sideOffset={8}>
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Espaços de trabalho
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {visibleWorkspaces.map((ws) => {
          const Icon = WORKSPACE_ICONS[ws.id]
          const isActive = ws.id === activeWorkspace
          return (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => handleSwitch(ws)}
              className="flex items-center gap-2.5 py-2.5 cursor-pointer"
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  ws.id === "tbo-academy"
                    ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white"
                    : "bg-primary text-primary-foreground"
                )}
              >
                <Icon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{ws.label}</p>
                <p className="text-[11px] text-muted-foreground leading-none">
                  {ws.description}
                </p>
              </div>
              {isActive && (
                <IconCheck className="size-4 text-primary shrink-0" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
