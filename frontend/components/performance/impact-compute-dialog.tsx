"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tbo-ui/dialog";
import { Button } from "@/components/tbo-ui/button";
import { Badge } from "@/components/tbo-ui/badge";
import { IMPACT_METRICS } from "@/lib/performance-constants";
import { formatPeriodLabel } from "@/lib/performance-constants";
import { useComputeAllImpact } from "@/hooks/use-impact-metrics";
import { Calculator, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface ImpactComputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: string;
  getName: (id: string) => string;
}

export function ImpactComputeDialog({
  open,
  onOpenChange,
  period,
  getName,
}: ImpactComputeDialogProps) {
  const computeAll = useComputeAllImpact();
  const [resultCount, setResultCount] = useState<number | null>(null);

  function handleCompute() {
    setResultCount(null);
    computeAll.mutate(
      { period, getName },
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
            <Calculator className="h-4 w-4" />
            Calcular Impacto — {formatPeriodLabel(period)}
          </DialogTitle>
          <DialogDescription>
            Calcula as 6 metricas de impacto para todos os colaboradores
            avaliados no periodo.
          </DialogDescription>
        </DialogHeader>

        {/* Metrics list */}
        <div className="space-y-2 py-2">
          {IMPACT_METRICS.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm"
            >
              <div className="flex items-center gap-2">
                <span>{m.name}</span>
                {m.isInverted && (
                  <Badge variant="outline" className="text-[9px] px-1">
                    invertido
                  </Badge>
                )}
              </div>
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
            <CheckCircle2 className="h-4 w-4" />
            {resultCount} colaborador(es) processado(s) com sucesso.
          </div>
        )}

        {computeAll.isError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-950/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">
            <XCircle className="h-4 w-4" />
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
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Calculando...
              </>
            ) : isDone ? (
              <>
                <Calculator className="mr-1 h-3 w-3" />
                Recalcular
              </>
            ) : (
              <>
                <Calculator className="mr-1 h-3 w-3" />
                Calcular Todos
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
