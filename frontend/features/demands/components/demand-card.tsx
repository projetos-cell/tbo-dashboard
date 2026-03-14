"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IconDots,
  IconExternalLink,
  IconTrash,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEMAND_STATUS, DEMAND_PRIORITY, BU_COLORS } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

export type DemandRow = Database["public"]["Tables"]["demands"]["Row"];

interface DemandCardProps {
  demand: DemandRow;
  onClick?: () => void;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  onDelete: () => void;
  isDragging?: boolean;
}

export function DemandCard({
  demand,
  onClick,
  onStatusChange,
  onPriorityChange,
  onDelete,
  isDragging,
}: DemandCardProps) {
  const priCfg = demand.prioridade
    ? DEMAND_PRIORITY[demand.prioridade.toLowerCase()]
    : null;
  const isDone =
    demand.feito ||
    demand.status === "Concluido" ||
    demand.status === "Concluído";
  const overdue =
    demand.due_date &&
    !isDone &&
    demand.due_date < new Date().toISOString().split("T")[0];

  return (
    <div
      className={`group relative cursor-pointer rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
        isDragging ? "opacity-50 ring-2 ring-tbo-orange/40" : ""
      }`}
      onClick={onClick}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1.5 right-1.5 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
            aria-label="Acoes"
          >
            <IconDots className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Acoes</DropdownMenuLabel>
            <DropdownMenuItem onClick={onClick}>Abrir detalhes</DropdownMenuItem>
            {demand.notion_url && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(demand.notion_url!, "_blank");
                }}
              >
                <IconExternalLink className="size-3.5 mr-2" />
                Abrir no Notion
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            {Object.entries(DEMAND_STATUS)
              .filter(([key]) => key !== "Concluido")
              .map(([key, cfg]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(key);
                  }}
                >
                  <span
                    className="size-2 rounded-full mr-2 shrink-0"
                    style={{ backgroundColor: cfg.color }}
                  />
                  {cfg.label}
                </DropdownMenuItem>
              ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Prioridade</DropdownMenuLabel>
            {Object.entries(DEMAND_PRIORITY).map(([key, cfg]) => (
              <DropdownMenuItem
                key={key}
                onClick={(e) => {
                  e.stopPropagation();
                  onPriorityChange(key);
                }}
              >
                <span
                  className="size-2 rounded-full mr-2 shrink-0"
                  style={{ backgroundColor: cfg.color }}
                />
                {cfg.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <IconTrash className="size-3.5 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <p
        className={`text-sm font-medium leading-tight pr-6 ${isDone ? "line-through opacity-60" : ""}`}
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
          <span className="text-xs text-gray-500">{demand.responsible}</span>
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
            className={`ml-auto text-xs ${overdue ? "font-medium text-red-600" : "text-gray-500"}`}
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
