"use client";

import { useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { IconLogout, IconSearch } from "@tabler/icons-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers";
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
import { useChatStore } from "@/features/chat/stores/chat-store";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useSidebarStore, undoSidebarReorder } from "@/stores/sidebar-store";
import { useLogout } from "@/hooks/use-logout";
import { useSidebarSearch } from "@/hooks/use-sidebar-search";
import { useSidebarDnd } from "@/hooks/use-sidebar-dnd";
import { useSidebarPreferences } from "@/hooks/use-sidebar-preferences";
import { getIcon } from "@/lib/icons";
import { SIDEBAR_NAV_GROUPS, PINNED_NAV_ITEMS } from "@/lib/navigation";
import { SortableNavGroup } from "@/components/layout/sidebar/sortable-nav-group";
import { SortableNavItem } from "@/components/layout/sidebar/sortable-nav-item";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";
import type { NavGroupItem } from "@/lib/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const modules = useAuthStore((s) => s.modules);
  const logout = useLogout();
  const { query, setQuery, filteredGroups } = useSidebarSearch(SIDEBAR_NAV_GROUPS);
  const chatUnreadCounts = useChatStore((s) => s.unreadCounts);
  const chatTotalUnread = useMemo(
    () => Object.values(chatUnreadCounts).reduce((sum, n) => sum + n, 0),
    [chatUnreadCounts],
  );

  // Initialize sidebar store with default nav groups
  const initFromDefaults = useSidebarStore((s) => s.initFromDefaults);
  const groupOrder = useSidebarStore((s) => s.groupOrder);

  useEffect(() => {
    initFromDefaults(SIDEBAR_NAV_GROUPS);
  }, [initFromDefaults]);

  // Sync sidebar preferences with Supabase (debounced auto-save)
  useSidebarPreferences();

  const canSee = useCallback(
    (module: string) => modules.includes("*") || modules.includes(module),
    [modules],
  );

  // D&D setup
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const {
    activeDrag,
    overGroupLabel,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useSidebarDnd();

  // Ordered groups (respecting saved order)
  const displayGroups = useMemo(() => {
    if (query.trim()) return filteredGroups;
    if (groupOrder.length === 0) return [...SIDEBAR_NAV_GROUPS];
    const groupMap = new Map(SIDEBAR_NAV_GROUPS.map((g) => [g.label, g]));
    const ordered = groupOrder.flatMap((label) => {
      const g = groupMap.get(label);
      if (g) { groupMap.delete(label); return [g]; }
      return [];
    });
    return [...ordered, ...groupMap.values()];
  }, [query, filteredGroups, groupOrder]);

  const groupIds = useMemo(
    () => displayGroups.map((g) => `group::${g.label}`),
    [displayGroups],
  );

  // Ctrl+Z undo
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        const undone = undoSidebarReorder();
        if (undone) {
          e.preventDefault();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleItemAction = useCallback(
    (action: string, item: NavGroupItem, _groupLabel: string) => {
      switch (action) {
        case "open-new-tab":
          window.open(item.href, "_blank");
          break;
        case "copy-link": {
          const url = `${window.location.origin}${item.href}`;
          navigator.clipboard.writeText(url).then(() => {
            toast.success("Link copiado!");
          });
          break;
        }
        case "hide":
          toast.info(`"${item.label}" oculto da sidebar`);
          break;
      }
    },
    [],
  );

  const isSearching = query.trim().length > 0;

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b px-2 py-2">
        <WorkspaceSwitcher />
      </SidebarHeader>

      <SidebarContent>
        {/* Search */}
        <SidebarGroup className="px-2 py-2">
          <SidebarGroupContent>
            <div className="relative">
              <IconSearch className="text-muted-foreground absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2" />
              <SidebarInput
                placeholder="Buscar..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-7"
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Pinned items — fixed, no group label */}
        <SidebarGroup className="px-2 pb-1 pt-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {PINNED_NAV_ITEMS.filter((item) => canSee(item.module)).map((item) => {
                const Icon = getIcon(item.icon);
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const badge = item.href === "/chat" && chatTotalUnread > 0 ? chatTotalUnread : 0;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {badge > 0 && (
                      <SidebarMenuBadge className="bg-destructive text-destructive-foreground text-[10px] font-semibold min-w-5 h-5 flex items-center justify-center rounded-full">
                        {badge > 99 ? "99+" : badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Divider — separates pinned items from customizable groups */}
        <div className="mx-3 border-t border-border/40" />

        {/* Nav groups with D&D */}
        {isSearching ? (
          // During search, render without D&D (static filtered view)
          displayGroups.map((group) => (
            <SortableNavGroup
              key={group.label}
              group={group}
              canSee={canSee}
              isDragOverlay
              onItemAction={handleItemAction}
            />
          ))
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={groupIds}
              strategy={verticalListSortingStrategy}
            >
              {displayGroups.map((group) => (
                <SortableNavGroup
                  key={group.label}
                  group={group}
                  canSee={canSee}
                  isDropTarget={overGroupLabel === group.label}
                  onItemAction={handleItemAction}
                />
              ))}
            </SortableContext>

            {/* Drag overlay — ghost element while dragging */}
            <DragOverlay dropAnimation={null}>
              {activeDrag?.type === "group" && activeDrag.group ? (
                <SortableNavGroup
                  group={activeDrag.group}
                  canSee={canSee}
                  isDragOverlay
                />
              ) : null}
              {activeDrag?.type === "item" && activeDrag.item && activeDrag.groupLabel ? (
                <SortableNavItem
                  item={activeDrag.item}
                  groupLabel={activeDrag.groupLabel}
                  isDragOverlay
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </SidebarContent>

      <SidebarFooter className="space-y-1 border-t p-2">
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={logout}>
          <IconLogout className="h-4 w-4" />
          Sair
        </Button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
