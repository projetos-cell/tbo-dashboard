"use client";

import { BarChart3, MessageSquarePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { OKR_STATUS } from "@/lib/constants";
import type { OkrStatusKey } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type KeyResultRow = Database["public"]["Tables"]["okr_key_results"]["Row"];

interface OkrKeyResultRowProps {
  kr: KeyResultRow;
  onCheckin: (kr: KeyResultRow) => void;
}

export function OkrKeyResultRow({ kr, onCheckin }: OkrKeyResultRowProps) {
  const start = kr.start_value ?? 0;
  const target = kr.target_value ?? 100;
  const current = kr.current_value ?? start;
  const range = target - start;
  const pct = range > 0 ? Math.min(((current - start) / range) * 100, 100) : 0;
  const statusCfg = OKR_STATUS[(kr.status as OkrStatusKey) ?? "on_track"] ??
    OKR_STATUS.on_track;

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background p-3">
      <BarChart3 className="h-4 w-4 text-muted-foreground shrink-0" />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{kr.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <Progress value={pct} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {current}
            {kr.unit ? ` ${kr.unit}` : ""} / {target}
            {kr.unit ? ` ${kr.unit}` : ""}
          </span>
        </div>
      </div>

      <Badge
        variant="outline"
        className="text-[10px] shrink-0"
        style={{ borderColor: statusCfg.color, color: statusCfg.color }}
      >
        {statusCfg.label}
      </Badge>

      <span className="text-xs font-medium w-[36px] text-right shrink-0">
        {Math.round(pct)}%
      </span>

      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 shrink-0"
        onClick={() => onCheckin(kr)}
        title="Novo check-in"
        aria-label="Novo check-in"
      >
        <MessageSquarePlus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
