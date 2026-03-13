"use client";

import {
  IconChevronDown,
  IconChevronRight,
  IconUser,
  IconDots,
  IconPencil,
  IconPlus,
  IconMessage,
  IconTrash,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OkrComments } from "@/features/okrs/components/okr-comments";
import { OKR_STATUS, OKR_LEVELS } from "@/lib/constants";
import type { OkrStatusKey, OkrLevelKey } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type ObjectiveRow = Database["public"]["Tables"]["okr_objectives"]["Row"];

interface OkrObjectiveCardProps {
  objective: ObjectiveRow;
  expanded: boolean;
  onToggle: () => void;
  onEdit: (obj: ObjectiveRow) => void;
  onDelete: (obj: ObjectiveRow) => void;
  onAddKr: (objectiveId: string) => void;
  showComments: boolean;
  onToggleComments: () => void;
  children?: React.ReactNode;
}

export function OkrObjectiveCard({
  objective,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onAddKr,
  showComments,
  onToggleComments,
  children,
}: OkrObjectiveCardProps) {
  const statusCfg =
    OKR_STATUS[(objective.status as OkrStatusKey) ?? "on_track"] ?? OKR_STATUS.on_track;
  const levelCfg =
    OKR_LEVELS[(objective.level as OkrLevelKey) ?? "squad"] ?? OKR_LEVELS.squad;
  const progress = objective.progress ?? 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header row */}
        <div className="flex items-center gap-3 p-4">
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-3 flex-1 min-w-0 text-left hover:bg-gray-100/40 -m-1 p-1 rounded transition-colors"
            aria-label={expanded ? "Recolher objetivo" : "Expandir objetivo"}
          >
            {expanded ? (
              <IconChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <IconChevronRight className="h-4 w-4 shrink-0" />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className="text-xs px-1.5"
                  style={{ borderColor: levelCfg.color, color: levelCfg.color }}
                >
                  {levelCfg.label}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs px-1.5"
                  style={{ borderColor: statusCfg.color, color: statusCfg.color }}
                >
                  {statusCfg.label}
                </Badge>
              </div>
              <p className="text-sm font-medium truncate">{objective.title}</p>
              {objective.description && (
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {objective.description}
                </p>
              )}
            </div>
          </button>

          <div className="flex items-center gap-3 shrink-0">
            {objective.owner_id && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <IconUser className="h-3 w-3" />
              </div>
            )}
            <div className="flex items-center gap-2 min-w-[120px]">
              <Progress value={progress} className="h-2 flex-1" />
              <span className="text-xs font-medium w-[36px] text-right">
                {Math.round(progress)}%
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  aria-label="Ações do objetivo"
                >
                  <IconDots className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(objective)}>
                  <IconPencil className="h-3.5 w-3.5 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddKr(objective.id)}>
                  <IconPlus className="h-3.5 w-3.5 mr-2" />
                  Adicionar Key Result
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleComments}>
                  <IconMessage className="h-3.5 w-3.5 mr-2" />
                  Comentários
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500"
                  onClick={() => onDelete(objective)}
                >
                  <IconTrash className="h-3.5 w-3.5 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Expanded: KRs */}
        {expanded && children && (
          <div className="border-t px-4 py-3 space-y-2 bg-gray-100/20">
            {children}
          </div>
        )}

        {/* Comments section */}
        {showComments && (
          <div className="border-t px-4 py-3 bg-gray-100/10">
            <OkrComments objectiveId={objective.id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
