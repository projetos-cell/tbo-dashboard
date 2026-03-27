"use client";

import {
  IconAlertTriangle,
  IconDiamond,
  IconClock,
  IconCheck,
  IconMessageCircle,
  IconRepeat,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  TASK_APPROVAL_STATUS,
  type TaskApprovalStatusKey,
} from "@/lib/constants";

interface TaskRowTitleCellProps {
  title: string | null;
  done: boolean;
  overdue: boolean;
  isMilestone: boolean;
  approvalKey: string | undefined;
  estimatedHours: number | null;
  loggedHours: number | null;
  recurrence: string;
  hasSubtasks: boolean;
  completedSubs: number;
  totalSubs: number;
}

export function TaskRowTitleCell({
  title,
  done,
  overdue,
  isMilestone,
  approvalKey,
  estimatedHours,
  loggedHours,
  recurrence,
  hasSubtasks,
  completedSubs,
  totalSubs,
}: TaskRowTitleCellProps) {
  const approvalConfig = approvalKey && approvalKey !== "none"
    ? TASK_APPROVAL_STATUS[approvalKey as TaskApprovalStatusKey]
    : null;

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5 min-w-0">
        {isMilestone && (
          <Tooltip>
            <TooltipTrigger asChild>
              <IconDiamond className="size-3.5 shrink-0 text-amber-500 fill-amber-100" />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">Marco</TooltipContent>
          </Tooltip>
        )}
        <span
          className={cn(
            "truncate text-sm font-medium",
            done && "text-muted-foreground line-through",
          )}
        >
          {title}
        </span>
        {overdue && !done && (
          <Badge
            variant="secondary"
            className="shrink-0 h-4 px-1 text-[10px] font-medium bg-red-50 text-red-600 border-red-200 gap-0.5"
          >
            <IconAlertTriangle className="size-2.5" />
            Atrasada
          </Badge>
        )}
        {approvalConfig && (
          <Badge
            variant="secondary"
            className="shrink-0 h-4 px-1 text-[10px] font-medium gap-0.5"
            style={{ backgroundColor: approvalConfig.bg, color: approvalConfig.color }}
          >
            {approvalKey === "approved" ? (
              <IconCheck className="size-2.5" />
            ) : approvalKey === "changes_requested" ? (
              <IconMessageCircle className="size-2.5" />
            ) : null}
            {approvalConfig.label}
          </Badge>
        )}
        {estimatedHours != null && estimatedHours > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="shrink-0 h-4 px-1 text-[10px] font-medium gap-0.5 text-muted-foreground"
              >
                <IconClock className="size-2.5" />
                {loggedHours != null && loggedHours > 0
                  ? `${loggedHours}h / ${estimatedHours}h`
                  : `${estimatedHours}h est.`}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {loggedHours != null && loggedHours > 0
                ? `${loggedHours}h registradas de ${estimatedHours}h estimadas`
                : `${estimatedHours}h estimadas`}
            </TooltipContent>
          </Tooltip>
        )}
        {recurrence !== "none" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="shrink-0 h-4 px-1 text-[10px] font-medium gap-0.5 text-muted-foreground"
              >
                <IconRepeat className="size-2.5" />
                {recurrence === "daily" ? "Diaria" : recurrence === "weekly" ? "Semanal" : "Mensal"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Tarefa recorrente ({recurrence === "daily" ? "diariamente" : recurrence === "weekly" ? "semanalmente" : "mensalmente"})
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {hasSubtasks && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-default" onClick={(e) => e.stopPropagation()}>
              <div className="flex-1 h-1 max-w-[80px] rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    completedSubs === totalSubs ? "bg-green-500" : "bg-blue-400",
                  )}
                  style={{ width: `${Math.round((completedSubs / totalSubs) * 100)}%` }}
                />
              </div>
              <span className="text-muted-foreground text-[10px] tabular-nums shrink-0">
                {completedSubs}/{totalSubs}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {completedSubs} de {totalSubs} subtarefas concluidas
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
