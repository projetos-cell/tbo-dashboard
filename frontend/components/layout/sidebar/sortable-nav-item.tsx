"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
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
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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
import type { NavGroupItem } from "@/lib/navigation";
import type { RoleSlug } from "@/lib/permissions";
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
        <SidebarMenuSub>
          {item.subItems!
            .filter((sub) => {
              if ("min_role" in sub && sub.min_role) {
                return hasMinRole(role as RoleSlug, sub.min_role as RoleSlug);
              }
              if (
                "founders_only" in sub &&
                (sub as Record<string, unknown>).founders_only
              ) {
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
    </Collapsible>
  );
});
