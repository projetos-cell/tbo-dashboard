"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical } from "@tabler/icons-react";
import {
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { getIcon } from "@/lib/icons";
import type { SubNavItem } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SortableSubNavItemProps {
  sub: SubNavItem;
  parentHref: string;
  isDragOverlay?: boolean;
}

export const SortableSubNavItem = memo(function SortableSubNavItem({
  sub,
  parentHref,
  isDragOverlay = false,
}: SortableSubNavItemProps) {
  const pathname = usePathname();
  const SubIcon = getIcon(sub.icon);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: `sub::${parentHref}::${sub.href}`,
    data: { type: "subitem", sub, parentHref },
    disabled: isDragOverlay,
  });

  const style = isDragOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  const subActive =
    sub.href === parentHref
      ? pathname === sub.href
      : pathname.startsWith(sub.href);

  return (
    <SidebarMenuSubItem
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/subitem relative",
        isDragging && "opacity-30",
        isDragOverlay && "bg-sidebar-accent rounded-md shadow-md opacity-90",
        isOver && !isDragging && "bg-accent/40",
      )}
    >
      <button
        type="button"
        className="text-muted-foreground/50 hover:text-muted-foreground absolute left-0 top-1/2 z-10 -translate-y-1/2 cursor-grab p-0.5 opacity-0 transition-opacity duration-150 active:cursor-grabbing group-hover/subitem:opacity-100"
        {...attributes}
        {...listeners}
        aria-label={`Arrastar ${sub.label}`}
      >
        <IconGripVertical className="h-2.5 w-2.5" />
      </button>
      <SidebarMenuSubButton asChild isActive={subActive} size="sm" className="pl-5">
        <Link href={sub.href}>
          <SubIcon className="h-3.5 w-3.5" />
          <span>{sub.label}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
});
