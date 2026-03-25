"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconSchool,
  IconBook2,
  IconRoute,
  IconCertificate,
  IconTrophy,
  IconSettings,
  IconCompass,
  IconLogout,
  IconStethoscope,
} from "@tabler/icons-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher"
import { useLogout } from "@/hooks/use-logout"

const ACADEMY_NAV = [
  {
    label: "Principal",
    items: [
      { href: "/academy", label: "Dashboard", icon: IconSchool },
      { href: "/academy/explorar", label: "Explorar Cursos", icon: IconCompass },
      { href: "/academy/meus-cursos", label: "Meus Cursos", icon: IconBook2 },
      { href: "/academy/trilhas", label: "Trilhas", icon: IconRoute },
      { href: "/academy/diagnostico", label: "Diagnóstico", icon: IconStethoscope },
    ],
  },
  {
    label: "Conquistas",
    items: [
      { href: "/academy/certificados", label: "Certificados", icon: IconCertificate },
      { href: "/academy/ranking", label: "Ranking", icon: IconTrophy },
    ],
  },
  {
    label: "Configurações",
    items: [
      { href: "/academy/configuracoes", label: "Preferências", icon: IconSettings },
    ],
  },
]

export function AcademySidebar() {
  const pathname = usePathname()
  const logout = useLogout()

  // Mock overall progress
  const overallProgress = 47

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b px-2 py-2">
        <WorkspaceSwitcher />
      </SidebarHeader>

      <SidebarContent>
        {/* Progress overview card */}
        <div className="mx-3 mt-3 rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-500/10 p-3 border border-violet-500/20">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Progresso geral
          </p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold">{overallProgress}%</span>
            <span className="text-xs text-muted-foreground">3 de 8 cursos</span>
          </div>
          <Progress value={overallProgress} className="h-1.5" />
        </div>

        {/* Navigation groups */}
        {ACADEMY_NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/academy"
                      ? pathname === "/academy"
                      : pathname.startsWith(item.href)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href}>
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="space-y-1 border-t p-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={logout}
        >
          <IconLogout className="size-4" />
          Sair
        </Button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
