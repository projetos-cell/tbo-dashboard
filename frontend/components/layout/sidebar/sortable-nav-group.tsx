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
          isDragging && "opacity-30",
          isDragOverlay && "bg-sidebar rounded-md shadow-lg opacity-95",
          isDropTarget && "ring-2 ring-primary/30 rounded-md bg-primary/5",
        )}
      >
        <SidebarGroup>
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
        isDragging && "opacity-30",
        isDragOverlay && "bg-sidebar rounded-md shadow-lg opacity-95",
        isDropTarget && "ring-2 ring-primary/30 rounded-md bg-primary/5",
      )}
    >
      <Collapsible
        open={!isCollapsed}
        onOpenChange={() => toggleGroup(group.label)}
      >
        <SidebarGroup>
          <div
            className={cn(
              "group/grouplabel relative flex items-center cursor-grab active:cursor-grabbing",
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...attributes}
            {...listeners}
          >
            {/* Drag handle visual indicator */}
            <span
              className={cn(
                "text-muted-foreground/50 absolute left-0 top-1/2 z-10 -translate-y-1/2 p-0.5 opacity-0 transition-opacity duration-150 pointer-events-none",
                (isHovered || isDragOverlay) && "opacity-100",
              )}
              aria-hidden="true"
            >
              <IconGripVertical className="h-3 w-3" />
            </span>

            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="flex-1 cursor-pointer pl-4">
                <IconChevronRight
                  className={cn(
                    "mr-1 h-3 w-3 transition-transform duration-200",
                    !isCollapsed && "rotate-90",
                  )}
                />
                {group.label}
              </SidebarGroupLabel>
            </CollapsibleTrigger>

            {/* Hover actions do grupo */}
            <div
              className={cn(
                "absolute right-1 top-1/2 z-10 flex -translate-y-1/2 items-center gap-0.5 opacity-0 transition-opacity duration-150",
                (isHovered || isDragOverlay) && "opacity-100",
              )}
            >
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm p-0.5 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const dest = orderedItems[0]?.href;
                  if (dest) router.push(dest);
                }}
                aria-label={`Ir para ${group.label}`}
              >
                <IconPlus className="h-3 w-3" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm p-0.5 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Opções de ${group.label}`}
                  >
                    <IconDots className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-48">
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
              <SidebarMenu>
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
