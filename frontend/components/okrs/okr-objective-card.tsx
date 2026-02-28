"use client";

import { ChevronDown, ChevronRight, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { OKR_STATUS, OKR_LEVELS } from "@/lib/constants";
import type { OkrStatusKey, OkrLevelKey } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type ObjectiveRow = Database["public"]["Tables"]["okr_objectives"]["Row"];

interface OkrObjectiveCardProps {
  objective: ObjectiveRow;
  expanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

export function OkrObjectiveCard({
  objective,
  expanded,
  onToggle,
  children,
}: OkrObjectiveCardProps) {
  const statusCfg = OKR_STATUS[(objective.status as OkrStatusKey) ?? "on_track"] ??
    OKR_STATUS.on_track;
  const levelCfg = OKR_LEVELS[(objective.level as OkrLevelKey) ?? "squad"] ??
    OKR_LEVELS.squad;
  const progress = objective.progress ?? 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/40 transition-colors"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className="text-[10px] px-1.5"
                style={{ borderColor: levelCfg.color, color: levelCfg.color }}
              >
                {levelCfg.label}
              </Badge>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5"
                style={{ borderColor: statusCfg.color, color: statusCfg.color }}
              >
                {statusCfg.label}
              </Badge>
            </div>
            <p className="text-sm font-medium truncate">{objective.title}</p>
            {objective.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {objective.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {objective.owner_id && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
              </div>
            )}
            <div className="flex items-center gap-2 min-w-[120px]">
              <Progress value={progress} className="h-2 flex-1" />
              <span className="text-xs font-medium w-[36px] text-right">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </button>

        {expanded && children && (
          <div className="border-t px-4 py-3 space-y-2 bg-muted/20">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
