"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getIcon } from "@/lib/icons";
import { NavItemHoverActions } from "./sortable-nav-item-parts";
import type { NavGroupItem } from "@/lib/navigation";
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
  const [isHovered, setIsHovered] = useState(false);

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
  const Icon = getIcon(item.icon);

  const sharedItemProps = {
    item,
    groupLabel,
    isHovered,
    isDragOverlay,
    onAction,
  };

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
});
