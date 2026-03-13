"use client";

import {
  IconChartBar,
  IconMessagePlus,
  IconDots,
  IconPencil,
  IconHistory,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ErrorState } from "@/components/shared";
import { useKeyResults } from "@/features/okrs/hooks/use-okrs";
import { OKR_STATUS } from "@/lib/constants";
import type { OkrStatusKey } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type KeyResultRow = Database["public"]["Tables"]["okr_key_results"]["Row"];

// ── Single KR row ──────────────────────────────────────────────────────

interface KeyResultItemProps {
  kr: KeyResultRow;
  onCheckin: (kr: KeyResultRow) => void;
  onEdit: (kr: KeyResultRow) => void;
  onDelete: (kr: KeyResultRow) => void;
  onHistory: (kr: KeyResultRow) => void;
}

export function KeyResultItem({
  kr,
  onCheckin,
  onEdit,
  onDelete,
  onHistory,
}: KeyResultItemProps) {
  const start = kr.start_value ?? 0;
  const target = kr.target_value ?? 100;
  const current = kr.current_value ?? start;
  const range = target - start;
  const pct = range > 0 ? Math.min(((current - start) / range) * 100, 100) : 0;
  const statusCfg =
    OKR_STATUS[(kr.status as OkrStatusKey) ?? "on_track"] ?? OKR_STATUS.on_track;

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-white p-3">
      <IconChartBar className="h-4 w-4 text-gray-500 shrink-0" />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{kr.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <Progress value={pct} className="h-1.5 flex-1" />
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {current}
            {kr.unit ? ` ${kr.unit}` : ""} / {target}
            {kr.unit ? ` ${kr.unit}` : ""}
          </span>
        </div>
      </div>

      <Badge
        variant="outline"
        className="text-xs shrink-0"
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
        aria-label="Novo check-in"
      >
        <IconMessagePlus className="h-3.5 w-3.5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 shrink-0"
            aria-label="Mais ações"
          >
            <IconDots className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(kr)}>
            <IconPencil className="h-3.5 w-3.5 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onHistory(kr)}>
            <IconHistory className="h-3.5 w-3.5 mr-2" />
            Histórico
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-500" onClick={() => onDelete(kr)}>
            <IconTrash className="h-3.5 w-3.5 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ── KR list for an objective ───────────────────────────────────────────

interface OkrKeyResultListProps {
  objectiveId: string;
  onCheckin: (kr: KeyResultRow) => void;
  onEditKr: (kr: KeyResultRow) => void;
  onDeleteKr: (kr: KeyResultRow) => void;
  onHistoryKr: (kr: KeyResultRow) => void;
  onAddKr: (objectiveId: string) => void;
}

export function OkrKeyResultList({
  objectiveId,
  onCheckin,
  onEditKr,
  onDeleteKr,
  onHistoryKr,
  onAddKr,
}: OkrKeyResultListProps) {
  const { data: keyResults, isLoading, error, refetch } = useKeyResults(objectiveId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-2">
      {keyResults && keyResults.length > 0 ? (
        keyResults.map((kr) => (
          <KeyResultItem
            key={kr.id}
            kr={kr}
            onCheckin={onCheckin}
            onEdit={onEditKr}
            onDelete={onDeleteKr}
            onHistory={onHistoryKr}
          />
        ))
      ) : (
        <p className="text-xs text-gray-500 py-2">Nenhum key result cadastrado.</p>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-xs"
        onClick={() => onAddKr(objectiveId)}
      >
        <IconPlus className="h-3.5 w-3.5 mr-1" />
        Adicionar Key Result
      </Button>
    </div>
  );
}
