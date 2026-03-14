"use client";

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
import { DEMAND_STATUS, DEMAND_PRIORITY } from "@/lib/constants";
import { IconDots, IconExternalLink, IconTrash } from "@tabler/icons-react";
import type { Database } from "@/lib/supabase/types";

type DemandRow = Database["public"]["Tables"]["demands"]["Row"];

interface DemandActionsMenuProps {
  row: DemandRow;
  onSelect: (demand: DemandRow) => void;
  onStatusChange: (id: string, status: string) => void;
  onPriorityChange: (id: string, priority: string) => void;
  onDelete: (id: string) => void;
}

export function DemandActionsMenu({
  row,
  onSelect,
  onStatusChange,
  onPriorityChange,
  onDelete,
}: DemandActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => e.stopPropagation()}
          aria-label="Acoes"
        >
          <IconDots className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Acoes</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onSelect(row);
            }}
          >
            Abrir detalhes
          </DropdownMenuItem>
          {row.notion_url && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                window.open(row.notion_url!, "_blank");
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
                  onStatusChange(row.id, key);
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
                onPriorityChange(row.id, key);
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
            onDelete(row.id);
          }}
        >
          <IconTrash className="size-3.5 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
