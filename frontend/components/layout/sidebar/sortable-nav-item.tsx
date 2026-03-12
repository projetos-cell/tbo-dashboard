"use client";

import { memo, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import {
  ChevronRight,
  Copy,
  ExternalLink,
  EyeOff,
  GripVertical,
  MoreHorizontal,
  MoveRight,
  Plus,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getIcon } from "@/lib/icons";
import { useAuthStore } from "@/stores/auth-store";
import { hasMinRole } from "@/lib/permissions";
import { useSidebarStore } from "@/stores/sidebar-store";
import { SortableSubNavItem } from "./sortable-sub-nav-item";
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
  const router = useRouter();
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

  // Compute ordered sub-items from persisted order
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

  // Role filter for sub-items
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

  const hoverActions = (
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
          router.push(item.href);
          onAction?.("add", item, groupLabel);
        }}
        aria-label={`Ir para ${item.label}`}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm p-0.5 transition-colors"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Opções de ${item.label}`}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-52">
          <DropdownMenuItem onClick={() => onAction?.("open-new-tab", item, groupLabel)}>
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            Abrir em nova aba
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAction?.("copy-link", item, groupLabel)}>
            <Copy className="mr-2 h-3.5 w-3.5" />
            Copiar link
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onAction?.("move-to", item, groupLabel)}>
            <MoveRight className="mr-2 h-3.5 w-3.5" />
            Mover para...
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onAction?.("hide", item, groupLabel)}
            className="text-muted-foreground"
          >
            <EyeOff className="mr-2 h-3.5 w-3.5" />
            Ocultar da sidebar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const dragHandle = (
    <button
      type="button"
      className={cn(
        "text-muted-foreground/50 hover:text-muted-foreground absolute left-0 top-1/2 z-10 -translate-y-1/2 cursor-grab p-0.5 opacity-0 transition-opacity duration-150 active:cursor-grabbing",
        (isHovered || isDragOverlay) && "opacity-100",
      )}
      {...attributes}
      {...listeners}
      aria-label={`Arrastar ${item.label}`}
    >
      <GripVertical className="h-3 w-3" />
    </button>
  );

  if (!hasSubItems) {
    return (
      <SidebarMenuItem
        ref={setNodeRef}
        style={style}
        className={cn(
          "group/item relative",
          isDragging && "opacity-30",
          isDragOverlay && "bg-sidebar-accent rounded-md shadow-lg opacity-90",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {dragHandle}
        <SidebarMenuButton asChild isActive={isActive} className="pl-5">
          <Link href={item.href}>
            <Icon className="h-4 w-4" />
            <span className="truncate">{item.label}</span>
          </Link>
        </SidebarMenuButton>
        {hoverActions}
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible defaultOpen={isActive} className="group/collapsible">
      <SidebarMenuItem
        ref={setNodeRef}
        style={style}
        className={cn(
          "group/item relative",
          isDragging && "opacity-30",
          isDragOverlay && "bg-sidebar-accent rounded-md shadow-lg opacity-90",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {dragHandle}
        <SidebarMenuButton asChild isActive={isActive} tooltip={item.label} className="pl-5">
          <Link href={item.href}>
            <Icon className="h-4 w-4" />
            <span className="truncate">{item.label}</span>
          </Link>
        </SidebarMenuButton>

        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              "text-muted-foreground hover:text-foreground absolute top-1/2 -translate-y-1/2 rounded-sm p-0.5 transition-all duration-150",
              isHovered ? "right-16" : "right-1",
            )}
            aria-label={`Expandir ${item.label}`}
          >
            <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </button>
        </CollapsibleTrigger>

        {hoverActions}
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
