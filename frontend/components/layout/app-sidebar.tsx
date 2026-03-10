"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Search } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useAlertCount } from "@/hooks/use-alert-count";
import { useLogout } from "@/hooks/use-logout";
import { useSidebarSearch } from "@/hooks/use-sidebar-search";
import { getIcon } from "@/lib/icons";
import { SIDEBAR_NAV_GROUPS, FOOTER_NAV_ITEMS } from "@/lib/navigation";
import { CollapsibleNavGroup } from "@/components/layout/sidebar/collapsible-nav-group";

function AlertsItem({ pathname, canSee }: { pathname: string; canSee: (m: string) => boolean }) {
  const count = useAlertCount();

  if (!canSee("alerts")) return null;

  const isActive = pathname === "/alerts" || pathname.startsWith("/alerts/");

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive}>
              <Link href="/alerts">
                <Bell className="h-4 w-4" />
                <span>Alertas</span>
              </Link>
            </SidebarMenuButton>
            {count > 0 && (
              <SidebarMenuBadge className="bg-destructive text-destructive-foreground text-[10px]">
                {count > 99 ? "99+" : count}
              </SidebarMenuBadge>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const modules = useAuthStore((s) => s.modules);
  const logout = useLogout();
  const { query, setQuery, filteredGroups } = useSidebarSearch(SIDEBAR_NAV_GROUPS);

  const canSee = (module: string) => modules.includes("*") || modules.includes(module);

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="bg-tbo-orange flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white">
            T
          </div>
          <div className="flex flex-col">
            <span className="text-sm leading-tight font-semibold">TBO</span>
            <span className="text-[10px] leading-tight text-gray-500">Dashboard</span>
          </div>
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

        {/* Alertas — fixed at top */}
        <AlertsItem pathname={pathname} canSee={canSee} />

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
