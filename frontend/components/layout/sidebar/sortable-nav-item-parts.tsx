"use client";

import { useRouter } from "next/navigation";
import {
  IconCopy,
  IconExternalLink,
  IconEyeOff,
  IconGripVertical,
  IconDots,
  IconArrowRight,
  IconPlus,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { SIDEBAR_NAV_GROUPS } from "@/lib/navigation";
import { useSidebarStore } from "@/stores/sidebar-store";
import type { NavGroupItem } from "@/lib/navigation";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { cn } from "@/lib/utils";

// ── Hover Actions ─────────────────────────────────────────────────────

interface NavItemHoverActionsProps {
  item: NavGroupItem;
  groupLabel: string;
  isHovered: boolean;
  isDragOverlay: boolean;
  onAction?: (action: string, item: NavGroupItem, groupLabel: string) => void;
}

export function NavItemHoverActions({
  item,
  groupLabel,
  isHovered,
  isDragOverlay,
  onAction,
}: NavItemHoverActionsProps) {
  const router = useRouter();
  const moveItemBetweenGroups = useSidebarStore((s) => s.moveItemBetweenGroups);

  return (
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
        <IconPlus className="h-3.5 w-3.5" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm p-0.5 transition-colors"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Opções de ${item.label}`}
          >
            <IconDots className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-52">
          <DropdownMenuItem onClick={() => onAction?.("open-new-tab", item, groupLabel)}>
            <IconExternalLink className="mr-2 h-3.5 w-3.5" />
            Abrir em nova aba
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAction?.("copy-link", item, groupLabel)}>
            <IconCopy className="mr-2 h-3.5 w-3.5" />
            Copiar link
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <IconArrowRight className="mr-2 h-3.5 w-3.5" />
              Mover para...
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {SIDEBAR_NAV_GROUPS.filter((g) => g.label !== groupLabel).map((g) => (
                <DropdownMenuItem
                  key={g.label}
                  onClick={() => {
                    moveItemBetweenGroups(item.href, groupLabel, g.label, 0);
                    toast.success(`"${item.label}" movido para ${g.label}`);
                  }}
                >
                  {g.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem
            onClick={() => onAction?.("hide", item, groupLabel)}
            className="text-muted-foreground"
          >
            <IconEyeOff className="mr-2 h-3.5 w-3.5" />
            Ocultar da sidebar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ── Drag Handle (visual indicator only — drag listeners are on the row) ──

interface NavItemDragHandleProps {
  item: NavGroupItem;
  isHovered: boolean;
  isDragOverlay: boolean;
  attributes?: DraggableAttributes;
  listeners?: SyntheticListenerMap | undefined;
}

export function NavItemDragHandle({
  item,
  isHovered,
  isDragOverlay,
}: NavItemDragHandleProps) {
  return (
    <span
      className={cn(
        "text-muted-foreground/50 absolute left-0 top-1/2 z-10 -translate-y-1/2 p-0.5 opacity-0 transition-opacity duration-150 pointer-events-none",
        (isHovered || isDragOverlay) && "opacity-100",
      )}
      aria-hidden="true"
    >
      <IconGripVertical className="h-3 w-3" />
    </span>
  );
}
