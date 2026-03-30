"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IconCalendar,
  IconRepeat,
  IconTrash,
  IconEdit,
  IconEyeOff,
} from "@tabler/icons-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RBACGuard } from "@/components/shared/rbac-guard";
import { HR_CATEGORY_COLORS, type HrCalendarItem } from "@/features/cultura/services/hr-calendar";
import { useDeleteHrEvent } from "@/features/cultura/hooks/use-hr-calendar";

interface HrEventDetailProps {
  item: HrCalendarItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (item: HrCalendarItem) => void;
}

export function HrEventDetail({ item, open, onOpenChange, onEdit }: HrEventDetailProps) {
  const deleteEvent = useDeleteHrEvent();

  if (!item) return null;

  const catInfo = HR_CATEGORY_COLORS[item.category];
  const startFormatted = format(parseISO(item.startDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const endFormatted = item.endDate
    ? format(parseISO(item.endDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null;

  function handleDelete() {
    if (!item) return;
    deleteEvent.mutate(item.id, {
      onSuccess: () => onOpenChange(false),
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] sm:w-[420px]">
        <SheetHeader>
          <SheetTitle className="text-left">{item.title}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Category badge */}
          <Badge
            variant="secondary"
            className="text-xs"
            style={{ backgroundColor: catInfo.bg, color: catInfo.text }}
          >
            {catInfo.label}
          </Badge>

          {/* Avatar for computed events */}
          {item.isComputed && item.avatarUrl && (
            <div className="flex items-center gap-3">
              <img
                src={item.avatarUrl}
                alt=""
                className="size-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium">
                  {item.title.replace(/^(Aniversário|[\d]+ anos? de TBO): /, "")}
                </p>
                {item.category === "aniversario" && (
                  <p className="text-xs text-muted-foreground">Aniversario</p>
                )}
              </div>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconCalendar className="size-4" />
            <span>
              {startFormatted}
              {endFormatted && ` — ${endFormatted}`}
            </span>
          </div>

          {/* Recurrence */}
          {item.recurrenceRule && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconRepeat className="size-4" />
              <span>Repete anualmente</span>
            </div>
          )}

          {/* Visibility */}
          {item.visibility === "leadership" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconEyeOff className="size-4" />
              <span>Visivel somente para lideranca</span>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <>
              <Separator />
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </>
          )}

          {/* Actions (admin only, non-computed) */}
          {!item.isComputed && (
            <RBACGuard allowedRoles={["admin"]}>
              <Separator />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(item);
                  }}
                >
                  <IconEdit className="mr-1.5 size-3.5" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteEvent.isPending}
                >
                  <IconTrash className="mr-1.5 size-3.5" />
                  {deleteEvent.isPending ? "Excluindo..." : "Excluir"}
                </Button>
              </div>
            </RBACGuard>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
