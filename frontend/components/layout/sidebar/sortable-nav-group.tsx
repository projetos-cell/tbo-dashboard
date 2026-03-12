"use client";

import { memo, useMemo, useState } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, GripVertical, MoreHorizontal, Plus } from "lucide-react";
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
import type { NavGroup, NavGroupItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface SortableNavGroupProps {
  group: NavGroup;
  canSee: (module: string) => boolean;
  isDragOverlay?: boolean;
  onItemAction?: (action: string, item: NavGroupItem, groupLabel: string) => void;
}

export const SortableNavGroup = memo(function SortableNavGroup({
  group,
  canSee,
  isDragOverlay = false,
  onItemAction,
}: SortableNavGroupProps) {
  const [isHovered, setIsHovered] = useState(false);
  const collapsedGroups = useSidebarStore((s) => s.collapsedGroups);
  const toggleGroup = useSidebarStore((s) => s.toggleGroup);
  const groupItemOrder = useSidebarStore((s) => s.groupItemOrder);

  const isCollapsed = collapsedGroups.has(group.label);
  const orderedItems = useMemo(() => {
    const order = groupItemOrder[group.label];
    const visible = group.items.filter((i) => canSee(i.module));
    if (!order) return visible;
    const itemMap = new Map(visible.map((i) => [i.href, i]));
    const result = order.flatMap((href) => {
      const item = itemMap.get(href);
      if (item) { itemMap.delete(href); return [item]; }
      return [];
    });
    return [...result, ...itemMap.values()];
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        isDragging && "opacity-30",
        isDragOverlay && "bg-sidebar rounded-md shadow-lg opacity-95",
      )}
    >
      <Collapsible
        open={!isCollapsed}
        onOpenChange={() => toggleGroup(group.label)}
      >
        <SidebarGroup>
          <div
            className="group/grouplabel relative flex items-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Drag handle para o grupo */}
            <button
              type="button"
              className={cn(
                "text-muted-foreground/50 hover:text-muted-foreground absolute left-0 top-1/2 z-10 -translate-y-1/2 cursor-grab p-0.5 opacity-0 transition-opacity duration-150 active:cursor-grabbing",
                (isHovered || isDragOverlay) && "opacity-100",
              )}
              {...attributes}
              {...listeners}
              aria-label={`Arrastar grupo ${group.label}`}
            >
              <GripVertical className="h-3 w-3" />
            </button>

            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="flex-1 cursor-pointer pl-4">
                <ChevronRight
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
                  // TODO: onAdd callback para o grupo
                }}
                aria-label={`Adicionar em ${group.label}`}
              >
                <Plus className="h-3 w-3" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm p-0.5 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Opções de ${group.label}`}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-48">
                  <DropdownMenuItem>Renomear seção</DropdownMenuItem>
                  <DropdownMenuItem>Recolher todas</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
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
