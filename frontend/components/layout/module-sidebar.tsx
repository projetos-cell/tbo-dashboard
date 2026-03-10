"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getIcon } from "@/lib/icons";
import { useAuthStore } from "@/stores/auth-store";
import { hasMinRole } from "@/lib/permissions";
import type { SubNavItem } from "@/lib/constants";
import type { RoleSlug } from "@/lib/permissions";

interface ModuleSidebarProps {
  title: string;
  items: readonly SubNavItem[];
  basePath: string;
}

export function ModuleSidebar({ title, items, basePath }: ModuleSidebarProps) {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);

  return (
    <nav data-sidebar className="hidden w-52 shrink-0 space-y-1 border-r bg-sidebar p-3 md:block">
      <h2 className="mb-3 px-2 text-xs font-semibold tracking-wider text-sidebar-foreground/50 uppercase">
        {title}
      </h2>
      <SidebarMenu>
        {items.map((item) => {
          if (item.min_role && !hasMinRole(role as RoleSlug, item.min_role)) {
            return null;
          }

          const Icon = getIcon(item.icon);
          const isActive = item.href === basePath ? pathname === basePath : pathname.startsWith(item.href);

          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={isActive} size="sm">
                <Link href={item.href}>
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </nav>
  );
}
