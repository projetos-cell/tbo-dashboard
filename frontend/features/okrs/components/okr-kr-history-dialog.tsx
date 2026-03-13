"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IconHistory, IconChartBar } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared";
import { useCheckins } from "@/features/okrs/hooks/use-okrs";
import type { Database } from "@/lib/supabase/types";

type KeyResultRow = Database["public"]["Tables"]["okr_key_results"]["Row"];
type CheckinRow = Database["public"]["Tables"]["okr_checkins"]["Row"];

interface OkrKrHistoryDialogProps {
  kr: KeyResultRow | null;
  open: boolean;
  onClose: () => void;
}

const CONFIDENCE_LABELS: Record<string, string> = {
  high: "Alta confiança",
  medium: "Média confiança",
  low: "Baixa confiança",
};

function CheckinItem({ checkin, unit }: { checkin: CheckinRow; unit: string | null }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border bg-gray-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">
          {checkin.new_value}
          {unit ? ` ${unit}` : ""}
          {checkin.previous_value != null && (
            <span className="ml-1 text-xs text-gray-400 font-normal">
              (era {checkin.previous_value}{unit ? ` ${unit}` : ""})
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {checkin.confidence && (
            <Badge variant="secondary" className="text-[10px]">
              {CONFIDENCE_LABELS[checkin.confidence] ?? checkin.confidence}
            </Badge>
          )}
          {checkin.created_at && (
            <span className="text-xs text-gray-400">
              {format(new Date(checkin.created_at), "dd MMM yyyy", { locale: ptBR })}
            </span>
          )}
        </div>
      </div>

      {checkin.notes && (
        <p className="text-xs text-gray-600 leading-relaxed">{checkin.notes}</p>
      )}
    </div>
  );
}

export function OkrKrHistoryDialog({ kr, open, onClose }: OkrKrHistoryDialogProps) {
  const { data: checkins, isLoading, error, refetch } = useCheckins(kr?.id ?? null);

  const start = kr?.start_value ?? 0;
  const target = kr?.target_value ?? 100;
  const current = kr?.current_value ?? start;
  const range = target - start;
  const pct = range > 0 ? Math.min(((current - start) / range) * 100, 100) : 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <IconHistory className="h-4 w-4 shrink-0" />
            Histórico de Check-ins
          </DialogTitle>
        </DialogHeader>

        {kr && (
          <div className="space-y-4">
            {/* KR summary */}
            <div className="rounded-lg border bg-white p-3 space-y-2">
              <div className="flex items-center gap-2">
                <IconChartBar className="h-4 w-4 text-gray-500 shrink-0" />
                <p className="text-sm font-medium">{kr.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={pct} className="h-1.5 flex-1" />
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {current}{kr.unit ? ` ${kr.unit}` : ""} / {target}{kr.unit ? ` ${kr.unit}` : ""}
                </span>
                <span className="text-xs font-medium w-[36px] text-right">
                  {Math.round(pct)}%
                </span>
              </div>
            </div>

            {/* Check-ins list */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))
              ) : error ? (
                <ErrorState message={error.message} onRetry={() => refetch()} />
              ) : (checkins ?? []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <IconHistory className="h-8 w-8 text-gray-400/50 mb-2" />
                  <p className="text-sm text-gray-500">Nenhum check-in registrado</p>
                  <p className="text-xs text-gray-400">
                    Use o botão de check-in para registrar o progresso.
                  </p>
                </div>
              ) : (
                (checkins ?? []).map((c) => (
                  <CheckinItem key={c.id} checkin={c} unit={kr.unit ?? null} />
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
