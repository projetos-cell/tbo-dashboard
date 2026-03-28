"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconCalendar,
  IconAlertTriangle,
} from "@tabler/icons-react";
import {
  getStatusBadgeProps,
  formatDateTime,
  isOverdue,
  type OneOnOneStatusKey,
} from "@/features/one-on-ones/utils/one-on-one-utils";
import { type OneOnOneRow } from "@/features/one-on-ones/services/one-on-ones";

interface OneOnOneCardProps {
  item: OneOnOneRow;
  getName: (id: string) => string;
  onOpenDetail: (item: OneOnOneRow) => void;
  onEdit: (item: OneOnOneRow) => void;
}

export function OneOnOneCard({
  item,
  getName,
  onOpenDetail,
  onEdit,
}: OneOnOneCardProps) {
  const badgeProps = getStatusBadgeProps(item.status as OneOnOneStatusKey);
  const overdueItem = isOverdue(item.status, item.scheduled_at);

  return (
    <div
      className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-gray-100/50 ${
        overdueItem ? "border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20" : ""
      }`}
      onClick={() => onOpenDetail(item)}
    >
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {getName(item.leader_id)} ↔ {getName(item.collaborator_id)}
          </span>
          <Badge
            variant="default"
            className="text-[10px]"
            style={badgeProps.style}
          >
            {badgeProps.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <IconCalendar className="h-3 w-3" />
            {formatDateTime(item.scheduled_at)}
          </span>
          {overdueItem && (
            <span className="flex items-center gap-1 font-medium text-red-600">
              <IconAlertTriangle className="h-3 w-3" />
              Atrasada
            </span>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(item);
        }}
      >
        Editar
      </Button>
    </div>
  );
}
