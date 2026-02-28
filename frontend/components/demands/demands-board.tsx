"use client";

import { Badge } from "@/components/ui/badge";
import {
  DEMAND_STATUS,
  DEMAND_PRIORITY,
  DEMAND_BOARD_COLUMNS,
  BU_COLORS,
} from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type DemandRow = Database["public"]["Tables"]["demands"]["Row"];

function DemandCard({
  demand,
  onClick,
}: {
  demand: DemandRow;
  onClick?: () => void;
}) {
  const priCfg = demand.prioridade
    ? DEMAND_PRIORITY[demand.prioridade.toLowerCase()]
    : null;
  const isDone =
    demand.feito ||
    demand.status === "Concluído" ||
    demand.status === "Concluido";
  const overdue =
    demand.due_date &&
    !isDone &&
    demand.due_date < new Date().toISOString().split("T")[0];

  return (
    <div
      className="cursor-pointer rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <p
        className={`text-sm font-medium leading-tight ${isDone ? "line-through opacity-60" : ""}`}
      >
        {demand.title}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {priCfg && (
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: priCfg.color }}
            title={priCfg.label}
          />
        )}
        {demand.responsible && (
          <span className="text-xs text-muted-foreground">
            {demand.responsible}
          </span>
        )}
        {demand.bus && demand.bus.length > 0 && (
          <div className="flex gap-0.5">
            {demand.bus.slice(0, 2).map((bu) => {
              const buColor = BU_COLORS[bu];
              return (
                <Badge
                  key={bu}
                  variant="secondary"
                  className="text-[9px] px-1 py-0"
                  style={
                    buColor
                      ? { backgroundColor: buColor.bg, color: buColor.color }
                      : undefined
                  }
                >
                  {bu}
                </Badge>
              );
            })}
          </div>
        )}
        {demand.due_date && (
          <span
            className={`ml-auto text-xs ${overdue ? "font-medium text-red-600" : "text-muted-foreground"}`}
          >
            {format(new Date(demand.due_date + "T12:00:00"), "dd MMM", {
              locale: ptBR,
            })}
          </span>
        )}
      </div>
    </div>
  );
}

interface DemandsBoardProps {
  demands: DemandRow[];
  onSelect: (demand: DemandRow) => void;
}

export function DemandsBoard({ demands, onSelect }: DemandsBoardProps) {
  // Normalize "Concluido" to "Concluído" for grouping
  const normalize = (status: string) =>
    status === "Concluido" ? "Concluído" : status;

  const demandsByStatus = DEMAND_BOARD_COLUMNS.reduce(
    (acc, status) => {
      acc[status] = demands.filter((d) => normalize(d.status) === status);
      return acc;
    },
    {} as Record<string, DemandRow[]>
  );

  return (
    <div className="grid auto-cols-[280px] grid-flow-col gap-4 overflow-x-auto pb-4">
      {DEMAND_BOARD_COLUMNS.map((status) => {
        const cfg = DEMAND_STATUS[status];
        const columnDemands = demandsByStatus[status] ?? [];

        return (
          <div key={status} className="flex flex-col">
            <div className="mb-2 flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: cfg?.color }}
              />
              <h3 className="text-sm font-semibold">{cfg?.label ?? status}</h3>
              <Badge variant="secondary" className="ml-auto text-xs">
                {columnDemands.length}
              </Badge>
            </div>
            <div className="min-h-[100px] space-y-2 rounded-lg bg-muted/30 p-2">
              {columnDemands.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  Nenhuma demanda
                </p>
              ) : (
                columnDemands.map((demand) => (
                  <DemandCard
                    key={demand.id}
                    demand={demand}
                    onClick={() => onSelect(demand)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
