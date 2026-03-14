"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PdiActionsInline } from "./pdi-actions-inline";
import { getGoalStatusBadgeProps, formatDate } from "@/features/pdi/utils/pdi-utils";
import type { PdiGoalWithActions } from "@/features/pdi/services/pdi";
import {
  IconChevronDown,
  IconChevronRight,
  IconTrash,
  IconPencil,
} from "@tabler/icons-react";

interface PdiGoalItemProps {
  goal: PdiGoalWithActions;
  pdiId: string;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function PdiGoalItem({
  goal,
  pdiId,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: PdiGoalItemProps) {
  const goalBadge = getGoalStatusBadgeProps(goal.status);
  const doneActions = goal.pdi_actions.filter((a: { completed: boolean }) => a.completed).length;
  const totalActions = goal.pdi_actions.length;

  return (
    <div className="rounded-lg border">
      <div
        className="flex cursor-pointer items-center gap-2 p-3"
        onClick={onToggle}
      >
        {expanded ? (
          <IconChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
        ) : (
          <IconChevronRight className="h-4 w-4 shrink-0 text-gray-500" />
        )}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{goal.title}</p>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="outline" className="text-xs" style={goalBadge.style}>
              {goalBadge.label}
            </Badge>
            {totalActions > 0 && (
              <span className="text-xs text-gray-500">
                {doneActions}/{totalActions} ações
              </span>
            )}
            {goal.skill_id && (
              <span className="text-xs text-gray-500">
                Skill vinculada
                {goal.target_level_percent != null && ` · Meta ${goal.target_level_percent}%`}
              </span>
            )}
            {goal.target_date && (
              <span className="text-xs text-gray-500">
                Meta: {formatDate(goal.target_date)}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-500 hover:text-gray-900"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <IconPencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-500 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <IconTrash className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t px-3 py-3">
          {goal.description && (
            <p className="mb-3 text-sm text-gray-500">{goal.description}</p>
          )}
          <PdiActionsInline
            goalId={goal.id}
            pdiId={pdiId}
            actions={goal.pdi_actions}
            mode="full"
          />
        </div>
      )}
    </div>
  );
}
