"use client";

import { memo, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconChevronRight, IconGripVertical, IconDots, IconPlus } from "@tabler/icons-react";
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
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortableNavItem } from "./sortable-nav-item";
import { useSidebarStore } from "@/stores/sidebar-store";
import { SIDEBAR_NAV_GROUPS } from "@/lib/navigation";
import type { NavGroup, NavGroupItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** Flat map of every item across all groups — needed for cross-group moves */
const ALL_ITEMS_MAP = new Map<string, NavGroupItem>(
  SIDEBAR_NAV_GROUPS.flatMap((g) => g.items.map((i) => [i.href, i])),
);

interface SortableNavGroupProps {
  group: NavGroup;
  canSee: (module: string) => boolean;
  isDragOverlay?: boolean;
  isDropTarget?: boolean;
  onItemAction?: (action: string, item: NavGroupItem, groupLabel: string) => void;
}

export const SortableNavGroup = memo(function SortableNavGroup({
  group,
  canSee,
  isDragOverlay = false,
  isDropTarget = false,
  onItemAction,
}: SortableNavGroupProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const collapsedGroups = useSidebarStore((s) => s.collapsedGroups);
  const toggleGroup = useSidebarStore((s) => s.toggleGroup);
  const collapseAllGroups = useSidebarStore((s) => s.collapseAllGroups);
  const groupItemOrder = useSidebarStore((s) => s.groupItemOrder);

  const isCollapsed = collapsedGroups.has(group.label);
  const orderedItems = useMemo(() => {
    const order = groupItemOrder[group.label];
    if (!order) {
      return group.items.filter((i) => canSee(i.module));
    }

    // Deduplicate: track seen hrefs to fix corrupt state from repeated moves
    const seen = new Set<string>();
    const result = order.flatMap((href) => {
      if (seen.has(href)) return [];
      seen.add(href);
      const item = ALL_ITEMS_MAP.get(href);
      if (!item || !canSee(item.module)) return [];
      return [item];
    });

    // Append native items not yet tracked in any group (new nav additions)
    const allTracked = new Set(Object.values(groupItemOrder).flat());
    for (const item of group.items) {
      if (!allTracked.has(item.href) && canSee(item.module)) {
        result.push(item);
      }
    }

    return result;
  }, [groupItemOrder, group, canSee]);

  const itemIds = useMemo(
    () => orderedItems.map((i) => i.href),
    [orderedItems],
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `group::${group.label}`,
    data: { type: "group", group },
    disabled: isDragOverlay,
  });

  const style = isDragOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  if (orderedItems.length === 0) return null;

  // Single-item group: skip group header to avoid "Pessoas > Pessoas" duplication
  const isSingleItem = orderedItems.length === 1;

  if (isSingleItem) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "transition-all duration-200",
          isDragging && "opacity-30",
          isDragOverlay && "bg-sidebar rounded-xl shadow-lg shadow-black/10 opacity-95",
          isDropTarget && "rounded-xl bg-sidebar-primary/5 shadow-[0_0_0_1px_var(--sidebar-primary)/20]",
        )}
      >
        <SidebarGroup className="px-3">
          <SidebarGroupContent>
            <SidebarMenu>
              <SortableNavItem
                item={orderedItems[0]}
                groupLabel={group.label}
                onAction={onItemAction}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "transition-all duration-200",
        isDragging && "opacity-30",
        isDragOverlay && "bg-sidebar rounded-xl shadow-lg shadow-black/10 opacity-95",
        isDropTarget && "rounded-xl bg-sidebar-primary/5 shadow-[0_0_0_1px_var(--sidebar-primary)/20]",
      )}
    >
      <Collapsible
        open={!isCollapsed}
        onOpenChange={() => toggleGroup(group.label)}
      >
        <SidebarGroup className="px-3">
          <div
            className={cn(
              "group/grouplabel relative flex items-center cursor-grab active:cursor-grabbing rounded-md transition-colors duration-150",
              isHovered && "bg-sidebar-accent/30",
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...attributes}
            {...listeners}
          >
            {/* Drag handle — appears with slight delay */}
            <span
              className={cn(
                "text-muted-foreground/40 absolute left-0 top-1/2 z-10 -translate-y-1/2 p-0.5 opacity-0 transition-opacity duration-300 pointer-events-none",
                (isHovered || isDragOverlay) && "opacity-100",
              )}
              aria-hidden="true"
            >
              <IconGripVertical className="size-2.5" />
            </span>

            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="flex-1 cursor-pointer pl-4 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">
                <IconChevronRight
                  className={cn(
                    "mr-1.5 size-3 transition-transform duration-200",
                    !isCollapsed && "rotate-90",
                  )}
                />
                {group.label}
              </SidebarGroupLabel>
            </CollapsibleTrigger>

            {/* Hover actions */}
            <div
              className={cn(
                "absolute right-0.5 top-1/2 z-10 flex -translate-y-1/2 items-center gap-0.5 opacity-0 transition-opacity duration-200",
                (isHovered || isDragOverlay) && "opacity-100",
              )}
            >
              <button
                type="button"
                className="text-muted-foreground/50 hover:text-foreground hover:bg-sidebar-accent rounded-md p-1 transition-colors duration-150"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const dest = orderedItems[0]?.href;
                  if (dest) router.push(dest);
                }}
                aria-label={`Ir para ${group.label}`}
              >
                <IconPlus className="size-3" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground/50 hover:text-foreground hover:bg-sidebar-accent rounded-md p-1 transition-colors duration-150"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Opções de ${group.label}`}
                  >
                    <IconDots className="size-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-48 rounded-xl">
                  <DropdownMenuItem disabled>Renomear seção</DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      collapseAllGroups(SIDEBAR_NAV_GROUPS.map((g) => g.label));
                    }}
                  >
                    Recolher todas
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled className="text-destructive">
                    Ocultar seção
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                <SortableContext
                  items={itemIds}
                  strategy={verticalListSortingStrategy}
                >
                  {orderedItems.map((item) => (
                    <SortableNavItem
                      key={item.href}
                      item={item}
                      groupLabel={group.label}
                      onAction={onItemAction}
                    />
                  ))}
                </SortableContext>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    </div>
  );
});
