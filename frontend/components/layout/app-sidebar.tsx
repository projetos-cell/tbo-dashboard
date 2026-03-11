"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Search } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/hooks/use-logout";
import { useSidebarSearch } from "@/hooks/use-sidebar-search";
import { getIcon } from "@/lib/icons";
import { SIDEBAR_NAV_GROUPS, FOOTER_NAV_ITEMS } from "@/lib/navigation";
import { CollapsibleNavGroup } from "@/components/layout/sidebar/collapsible-nav-group";

export function AppSidebar() {
  const pathname = usePathname();
  const modules = useAuthStore((s) => s.modules);
  const logout = useLogout();
  const { query, setQuery, filteredGroups } = useSidebarSearch(SIDEBAR_NAV_GROUPS);

  const canSee = (module: string) => modules.includes("*") || modules.includes(module);

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/dashboard" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-tbo.svg"
            alt="TBO"
            width={80}
            height={32}
            className="block dark:hidden"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-tbo-dark.svg"
            alt="TBO"
            width={80}
            height={32}
            className="hidden dark:block"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Search */}
        <SidebarGroup className="px-2 py-2">
          <SidebarGroupContent>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2" />
              <SidebarInput
                placeholder="Buscar..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-7"
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Nav groups */}
        {filteredGroups.map((group) => (
          <CollapsibleNavGroup key={group.label} group={group} canSee={canSee} />
        ))}
      </SidebarContent>

      <SidebarFooter className="space-y-1 border-t p-2">
        <SidebarMenu>
          {FOOTER_NAV_ITEMS.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
