"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconMessage,
  IconTarget,
  IconTrendingUp,
  IconListCheck,
  IconFlame,
  IconAlertTriangle,
} from "@tabler/icons-react";
import type { PersonSnapshot } from "@/features/people/services/people-snapshot";
import {
  derive1on1Status,
  derivePdiStatus,
  isOverloaded,
  isAtRisk,
  type OneOnOneStatus,
  type PdiStatusDisplay,
} from "@/features/people/services/people-snapshot";

// ---------------------------------------------------------------------------
// Color config per metric value
// ---------------------------------------------------------------------------

const ONE_ON_ONE_COLORS: Record<OneOnOneStatus | string, string> = {
  Nunca: "text-gray-500",
  Pendente: "text-orange-600 dark:text-orange-400",
};
// Numeric "Xd" defaults to green-ish
const DEFAULT_1ON1_COLOR = "text-emerald-600 dark:text-emerald-400";

const PDI_COLORS: Record<PdiStatusDisplay, string> = {
  Sem: "text-gray-500",
  "Em dia": "text-emerald-600 dark:text-emerald-400",
  Atrasado: "text-red-600 dark:text-red-400",
  Desatualizado: "text-orange-600 dark:text-orange-400",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface PersonSnapshotBarProps {
  snapshot: PersonSnapshot | undefined;
}

export function PersonSnapshotBar({ snapshot }: PersonSnapshotBarProps) {
  if (!snapshot) return null;

  const oneOnOneStatus = derive1on1Status(snapshot.last_1on1_at);
  const pdiStatus = derivePdiStatus(
    snapshot.pdi_status,
    snapshot.pdi_last_updated_at
  );
  const score = snapshot.performance_score;
  const tasks = snapshot.active_tasks_count;
  const overloaded = isOverloaded(tasks);
  const atRisk = isAtRisk(score, snapshot.pdi_status);

  const oneOnOneColor =
    ONE_ON_ONE_COLORS[oneOnOneStatus] ?? DEFAULT_1ON1_COLOR;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="mt-3 border-t pt-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* 1:1 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium ${oneOnOneColor}`}
              >
                <IconMessage className="h-3 w-3" />
                {oneOnOneStatus}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {oneOnOneStatus === "Nunca"
                ? "Nenhum 1:1 registrado"
                : oneOnOneStatus === "Pendente"
                  ? "1:1 pendente (>30 dias)"
                  : `Último 1:1 há ${oneOnOneStatus}`}
            </TooltipContent>
          </Tooltip>

          {/* PDI */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium ${PDI_COLORS[pdiStatus]}`}
              >
                <IconTarget className="h-3 w-3" />
                {pdiStatus}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {pdiStatus === "Sem"
                ? "Sem PDI cadastrado"
                : pdiStatus === "Em dia"
                  ? "PDI em dia"
                  : pdiStatus === "Atrasado"
                    ? "PDI atrasado"
                    : "PDI desatualizado (>90 dias)"}
            </TooltipContent>
          </Tooltip>

          {/* Score */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                  score === null
                    ? "text-gray-500"
                    : score < 60
                      ? "text-red-600 dark:text-red-400"
                      : score < 80
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                <IconTrendingUp className="h-3 w-3" />
                {score !== null ? score : "—"}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {score !== null
                ? `Score de performance: ${score}`
                : "Score não disponível"}
            </TooltipContent>
          </Tooltip>

          {/* Carga (Tasks) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                  overloaded
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-500"
                }`}
              >
                {overloaded ? (
                  <IconFlame className="h-3 w-3" />
                ) : (
                  <IconListCheck className="h-3 w-3" />
                )}
                {tasks}
                {overloaded && (
                  <span className="text-[10px] font-semibold uppercase">
                    Overload
                  </span>
                )}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {overloaded
                ? `Sobrecarga: ${tasks} tarefas ativas (≥8)`
                : `${tasks} tarefa${tasks !== 1 ? "s" : ""} ativa${tasks !== 1 ? "s" : ""}`}
            </TooltipContent>
          </Tooltip>

          {/* At Risk badge */}
          {atRisk && (
            <Badge
              variant="destructive"
              className="ml-auto h-5 gap-1 px-1.5 text-[10px] font-semibold"
            >
              <IconAlertTriangle className="h-3 w-3" />
              Em risco
            </Badge>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
