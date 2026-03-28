"use client";

import { memo, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { IconChevronRight } from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { getIcon } from "@/lib/icons";
import { useAuthStore } from "@/stores/auth-store";
import { hasMinRole } from "@/lib/permissions";
import { useSidebarStore } from "@/stores/sidebar-store";
import { SortableSubNavItem } from "./sortable-sub-nav-item";
import { NavItemHoverActions, NavItemDragHandle } from "./sortable-nav-item-parts";
import type { NavGroupItem } from "@/lib/navigation";
import type { RoleSlug } from "@/lib/permissions";
import type { SubNavItem } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SortableNavItemProps {
  item: NavGroupItem;
  groupLabel: string;
  isDragOverlay?: boolean;
  onAction?: (action: string, item: NavGroupItem, groupLabel: string) => void;
}

export const SortableNavItem = memo(function SortableNavItem({
  item,
  groupLabel,
  isDragOverlay = false,
  onAction,
}: SortableNavItemProps) {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);
  const [isHovered, setIsHovered] = useState(false);
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

  const subItemOrder = useSidebarStore((s) => s.subItemOrder);
  const reorderSubItems = useSidebarStore((s) => s.reorderSubItems);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.href,
    data: { type: "item", item, groupLabel },
    disabled: isDragOverlay,
  });

  const style = isDragOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const Icon = getIcon(item.icon);

  const orderedSubItems = useMemo<readonly SubNavItem[]>(() => {
    if (!item.subItems || item.subItems.length === 0) return [];
    const order = subItemOrder[item.href];
    if (!order) return item.subItems;
    const subMap = new Map(item.subItems.map((s) => [s.href, s]));
    const result: SubNavItem[] = [];
    for (const href of order) {
      const s = subMap.get(href);
      if (s) { result.push(s); subMap.delete(href); }
    }
    for (const s of subMap.values()) result.push(s);
    return result;
  }, [item.subItems, item.href, subItemOrder]);

  const subItemIds = useMemo(
    () => orderedSubItems.map((s) => `sub::${item.href}::${s.href}`),
    [orderedSubItems, item.href],
  );

  const activeSubItem = useMemo(
    () => activeSubId
      ? orderedSubItems.find((s) => `sub::${item.href}::${s.href}` === activeSubId) ?? null
      : null,
    [activeSubId, orderedSubItems, item.href],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleSubDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveSubId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = subItemIds.indexOf(active.id as string);
      const newIndex = subItemIds.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const newOrder = arrayMove([...orderedSubItems], oldIndex, newIndex).map((s) => s.href);
      reorderSubItems(item.href, newOrder);
    },
    [subItemIds, orderedSubItems, item.href, reorderSubItems],
  );

  const filteredSubItems = useMemo(
    () =>
      orderedSubItems.filter((sub) => {
        if ("min_role" in sub && sub.min_role) {
          return hasMinRole(role as RoleSlug, sub.min_role as RoleSlug);
        }
        if ("founders_only" in sub && (sub as Record<string, unknown>).founders_only) {
          return role === "founder" || role === "diretoria";
        }
        return true;
      }),
    [orderedSubItems, role],
  );

  const filteredSubIds = useMemo(
    () => filteredSubItems.map((s) => `sub::${item.href}::${s.href}`),
    [filteredSubItems, item.href],
  );

  const sharedItemProps = {
    item,
    groupLabel,
    isHovered,
    isDragOverlay,
    onAction,
  };

  if (!hasSubItems) {
    return (
      <SidebarMenuItem
        ref={setNodeRef}
        style={style}
        className={cn(
          "group/item relative flex items-center cursor-grab active:cursor-grabbing",
          isDragging && "opacity-30",
          isDragOverlay && "bg-sidebar-accent rounded-lg shadow-lg shadow-black/10 opacity-90",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...attributes}
        {...listeners}
      >
        {/* Spacer to align with chevron of collapsible items */}
        <span className="shrink-0 p-0.5"><span className="inline-block size-3.5" /></span>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          className={cn(
            "relative pl-0 rounded-lg transition-all duration-150",
            isActive && "bg-sidebar-accent font-medium shadow-sm shadow-black/[0.03]",
          )}
        >
          <Link href={item.href}>
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-sidebar-indicator" />
            )}
            <Icon className={cn(
              "size-[18px] transition-colors duration-150",
              isActive ? "text-sidebar-primary" : "text-muted-foreground/60",
            )} />
            <span className="truncate">{item.label}</span>
          </Link>
        </SidebarMenuButton>
        <NavItemHoverActions {...sharedItemProps} />
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible defaultOpen={isActive} className="group/collapsible">
      <SidebarMenuItem
        ref={setNodeRef}
        style={style}
        className={cn(
          "group/item relative flex items-center cursor-grab active:cursor-grabbing",
          isDragging && "opacity-30",
          isDragOverlay && "bg-sidebar-accent rounded-lg shadow-lg shadow-black/10 opacity-90",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...attributes}
        {...listeners}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground/50 hover:text-foreground flex shrink-0 items-center rounded-md p-0.5 transition-colors duration-150"
            aria-label={`Expandir ${item.label}`}
          >
            <IconChevronRight className="size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </button>
        </CollapsibleTrigger>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={item.label}
          className={cn(
            "relative pl-0 rounded-lg transition-all duration-150",
            isActive && "bg-sidebar-accent font-medium shadow-sm shadow-black/[0.03]",
          )}
        >
          <Link href={item.href}>
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-sidebar-indicator" />
            )}
            <Icon className={cn(
              "size-[18px] transition-colors duration-150",
              isActive ? "text-sidebar-primary" : "text-muted-foreground/60",
            )} />
            <span className="truncate">{item.label}</span>
          </Link>
        </SidebarMenuButton>

        <NavItemHoverActions {...sharedItemProps} />
      </SidebarMenuItem>

      <CollapsibleContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(e) => setActiveSubId(e.active.id as string)}
          onDragEnd={handleSubDragEnd}
          onDragCancel={() => setActiveSubId(null)}
        >
          <SortableContext items={filteredSubIds} strategy={verticalListSortingStrategy}>
            <SidebarMenuSub>
              {filteredSubItems.map((sub) => (
                <SortableSubNavItem
                  key={sub.href}
                  sub={sub}
                  parentHref={item.href}
                />
              ))}
            </SidebarMenuSub>
          </SortableContext>
          <DragOverlay>
            {activeSubItem ? (
              <SortableSubNavItem
                sub={activeSubItem}
                parentHref={item.href}
                isDragOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </CollapsibleContent>
    </Collapsible>
  );
});
