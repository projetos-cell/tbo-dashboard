"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DEMAND_STATUS, DEMAND_PRIORITY, BU_COLORS } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Circle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type DemandRow = Database["public"]["Tables"]["demands"]["Row"];

interface DemandsListProps {
  demands: DemandRow[];
  onSelect: (demand: DemandRow) => void;
}

export function DemandsList({ demands, onSelect }: DemandsListProps) {
  if (demands.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Nenhuma demanda encontrada
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10" />
          <TableHead>Titulo</TableHead>
          <TableHead className="hidden md:table-cell">Status</TableHead>
          <TableHead className="hidden md:table-cell">Prioridade</TableHead>
          <TableHead className="hidden lg:table-cell">Responsavel</TableHead>
          <TableHead className="hidden lg:table-cell">BU</TableHead>
          <TableHead className="hidden lg:table-cell">Prazo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {demands.map((demand) => {
          const statusCfg = DEMAND_STATUS[demand.status];
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
            <TableRow
              key={demand.id}
              className="cursor-pointer"
              onClick={() => onSelect(demand)}
            >
              <TableCell>
                <div className="h-6 w-6 flex items-center justify-center">
                  {isDone ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`truncate ${isDone ? "line-through opacity-60" : ""}`}
                  >
                    {demand.title}
                  </span>
                  {demand.notion_url && (
                    <a
                      href={demand.notion_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {statusCfg && (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: statusCfg.bg,
                      color: statusCfg.color,
                    }}
                  >
                    {statusCfg.label}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {priCfg && (
                  <span
                    className="text-xs font-medium"
                    style={{ color: priCfg.color }}
                  >
                    {priCfg.label}
                  </span>
                )}
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                {demand.responsible ?? "—"}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex flex-wrap gap-1">
                  {demand.bus?.map((bu) => {
                    const buColor = BU_COLORS[bu];
                    return (
                      <Badge
                        key={bu}
                        variant="secondary"
                        className="text-[10px]"
                        style={
                          buColor
                            ? {
                                backgroundColor: buColor.bg,
                                color: buColor.color,
                              }
                            : undefined
                        }
                      >
                        {bu}
                      </Badge>
                    );
                  })}
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {demand.due_date ? (
                  <span
                    className={`text-sm ${
                      overdue
                        ? "font-medium text-red-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {format(
                      new Date(demand.due_date + "T12:00:00"),
                      "dd MMM yyyy",
                      { locale: ptBR }
                    )}
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
