"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChevronRight } from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { getIcon } from "@/lib/icons";
import { useAuthStore } from "@/stores/auth-store";
import { hasMinRole } from "@/lib/permissions";
import type { NavGroup } from "@/lib/navigation";
import type { RoleSlug } from "@/lib/permissions";

interface CollapsibleNavGroupProps {
  group: NavGroup;
  canSee: (module: string) => boolean;
}

export function CollapsibleNavGroup({ group, canSee }: CollapsibleNavGroupProps) {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);

  const visible = group.items.filter((i) => canSee(i.module));
  if (visible.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {visible.map((item) => {
            const Icon = getIcon(item.icon);
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const hasSubItems = item.subItems && item.subItems.length > 0;

            if (!hasSubItems) {
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.href}>
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            return (
              <Collapsible key={item.href} defaultOpen={isActive} className="group/collapsible">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                    <Link href={item.href}>
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>

                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction
                      className="data-[state=open]:rotate-90"
                      aria-label={`Expandir ${item.label}`}
                    >
                      <IconChevronRight className="h-3.5 w-3.5" />
                    </SidebarMenuAction>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.subItems!
                        .filter((sub) => {
                          if ("min_role" in sub && sub.min_role) {
                            return hasMinRole(role as RoleSlug, sub.min_role as RoleSlug);
                          }
                          if ("founders_only" in sub && (sub as Record<string, unknown>).founders_only) {
                            return role === "founder" || role === "diretoria";
                          }
                          return true;
                        })
                        .map((sub) => {
                          const SubIcon = getIcon(sub.icon);
                          const subActive =
                            sub.href === item.href
                              ? pathname === sub.href
                              : pathname.startsWith(sub.href);

                          return (
                            <SidebarMenuSubItem key={sub.href}>
                              <SidebarMenuSubButton asChild isActive={subActive} size="sm">
                                <Link href={sub.href}>
                                  <SubIcon className="h-3.5 w-3.5" />
                                  <span>{sub.label}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
