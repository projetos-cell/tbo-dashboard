"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CULTURE_METRICS } from "@/features/performance/utils/performance-constants";
import { formatPeriodLabel } from "@/features/performance/utils/performance-constants";
import { useComputeAllCulture } from "@/features/cultura/hooks/use-culture-metrics";
import { IconCalculator, IconLoader2, IconCircleCheck, IconCircleX } from "@tabler/icons-react";

interface CultureComputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: string;
}

export function CultureComputeDialog({
  open,
  onOpenChange,
  period,
}: CultureComputeDialogProps) {
  const computeAll = useComputeAllCulture();
  const [resultCount, setResultCount] = useState<number | null>(null);

  function handleCompute() {
    setResultCount(null);
    computeAll.mutate(
      { period },
      {
        onSuccess: (data) => {
          setResultCount(data.length);
        },
      }
    );
  }

  function handleClose() {
    setResultCount(null);
    onOpenChange(false);
  }

  const isComputing = computeAll.isPending;
  const isDone = resultCount != null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconCalculator className="h-4 w-4" />
            Calcular Cultura — {formatPeriodLabel(period)}
          </DialogTitle>
          <DialogDescription>
            Calcula as 6 metricas de cultura para todos os colaboradores
            avaliados no periodo.
          </DialogDescription>
        </DialogHeader>

        {/* Metrics list */}
        <div className="space-y-2 py-2">
          {CULTURE_METRICS.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm"
            >
              <span>{m.name}</span>
              {m.available ? (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-0 text-[10px]">
                  Disponivel
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px]">
                  N/D
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Result */}
        {isDone && (
          <div className="flex items-center gap-2 rounded-md bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
            <IconCircleCheck className="h-4 w-4" />
            {resultCount} colaborador(es) processado(s) com sucesso.
          </div>
        )}

        {computeAll.isError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-950/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">
            <IconCircleX className="h-4 w-4" />
            Erro: {(computeAll.error as Error)?.message ?? "Erro desconhecido"}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {isDone ? "Fechar" : "Cancelar"}
          </Button>
          <Button onClick={handleCompute} disabled={isComputing}>
            {isComputing ? (
              <>
                <IconLoader2 className="mr-1 h-3 w-3 animate-spin" />
                Calculando...
              </>
            ) : isDone ? (
              <>
                <IconCalculator className="mr-1 h-3 w-3" />
                Recalcular
              </>
            ) : (
              <>
                <IconCalculator className="mr-1 h-3 w-3" />
                Calcular Todos
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
