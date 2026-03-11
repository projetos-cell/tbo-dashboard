"use client";

import { useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { LogOut, Search } from "lucide-react";
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useSidebarStore, undoSidebarReorder } from "@/stores/sidebar-store";
import { useLogout } from "@/hooks/use-logout";
import { useSidebarSearch } from "@/hooks/use-sidebar-search";
import { useSidebarDnd } from "@/hooks/use-sidebar-dnd";
import { useSidebarPreferences } from "@/hooks/use-sidebar-preferences";
import { getIcon } from "@/lib/icons";
import { SIDEBAR_NAV_GROUPS, FOOTER_NAV_ITEMS } from "@/lib/navigation";
import { SortableNavGroup } from "@/components/layout/sidebar/sortable-nav-group";
import { SortableNavItem } from "@/components/layout/sidebar/sortable-nav-item";
import type { NavGroupItem } from "@/lib/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const modules = useAuthStore((s) => s.modules);
  const logout = useLogout();
  const { query, setQuery, filteredGroups } = useSidebarSearch(SIDEBAR_NAV_GROUPS);

  // Initialize sidebar store with default nav groups
  const initFromDefaults = useSidebarStore((s) => s.initFromDefaults);
  const getOrderedGroups = useSidebarStore((s) => s.getOrderedGroups);

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
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useSidebarDnd();

  // Ordered groups (respecting saved order)
  const displayGroups = useMemo(() => {
    // When searching, use filtered groups directly
    if (query.trim()) return filteredGroups;
    return getOrderedGroups(SIDEBAR_NAV_GROUPS);
  }, [query, filteredGroups, getOrderedGroups]);

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
        case "move-to":
          toast.info("Mover para... (em breve)");
          break;
      }
    },
    [],
  );

  const isSearching = query.trim().length > 0;

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
