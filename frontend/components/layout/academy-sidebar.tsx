"use client"

import { useState } from "react"
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
  IconLock,
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
import { useAcademyEntitlement } from "@/features/academy/hooks/use-academy-entitlement"
import { PricingDialog } from "@/features/diagnostico/components/pricing-dialog"
import type { ProductSlug } from "@/features/academy/hooks/use-academy-entitlement"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  requiredProduct: ProductSlug
}

const ACADEMY_NAV: { label: string; items: NavItem[] }[] = [
  {
    label: "Principal",
    items: [
      { href: "/academy", label: "Dashboard", icon: IconSchool, requiredProduct: "diagnostic" },
      { href: "/academy/explorar", label: "Explorar Cursos", icon: IconCompass, requiredProduct: "diagnostic" },
      { href: "/academy/meus-cursos", label: "Meus Cursos", icon: IconBook2, requiredProduct: "essencial" },
      { href: "/academy/trilhas", label: "Trilhas", icon: IconRoute, requiredProduct: "essencial" },
      { href: "/academy/diagnostico", label: "Diagnóstico", icon: IconStethoscope, requiredProduct: "diagnostic" },
    ],
  },
  {
    label: "Conquistas",
    items: [
      { href: "/academy/certificados", label: "Certificados", icon: IconCertificate, requiredProduct: "essencial" },
      { href: "/academy/ranking", label: "Ranking", icon: IconTrophy, requiredProduct: "essencial" },
    ],
  },
  {
    label: "Configurações",
    items: [
      { href: "/academy/configuracoes", label: "Preferências", icon: IconSettings, requiredProduct: "diagnostic" },
    ],
  },
]

const PRODUCT_TIER: Record<ProductSlug, number> = {
  diagnostic: 0,
  essencial: 1,
  profissional: 2,
  enterprise: 3,
}

export function AcademySidebar() {
  const pathname = usePathname()
  const logout = useLogout()
  const [pricingOpen, setPricingOpen] = useState(false)
  const { product } = useAcademyEntitlement()

  const overallProgress = 47

  const canAccess = (requiredProduct: ProductSlug) =>
    PRODUCT_TIER[product] >= PRODUCT_TIER[requiredProduct]

  return (
    <>
      <Sidebar variant="inset">
        <SidebarHeader className="border-b px-2 py-2">
          <WorkspaceSwitcher />
        </SidebarHeader>

        <SidebarContent>
          {/* Progress overview card */}
          <div className="mx-3 mt-3 rounded-lg bg-gradient-to-br from-[#b8f724]/10 to-[#0a1f1d]/10 p-3 border border-[#b8f724]/20">
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
                    const hasAccess = canAccess(item.requiredProduct)

                    if (!hasAccess) {
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            onClick={() => setPricingOpen(true)}
                            className="opacity-50 cursor-pointer"
                          >
                            <item.icon className="size-4" />
                            <span className="flex-1">{item.label}</span>
                            <IconLock className="size-3 text-muted-foreground shrink-0" />
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    }

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

      <PricingDialog open={pricingOpen} onOpenChange={setPricingOpen} />
    </>
  )
}
