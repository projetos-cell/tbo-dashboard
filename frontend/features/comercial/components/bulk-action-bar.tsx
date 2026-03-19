"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconArrowRight, IconX, IconUser } from "@tabler/icons-react";
import { DEAL_STAGES, type DealStageKey } from "@/lib/constants";

interface BulkActionBarProps {
  selectedCount: number;
  onMoveToStage: (stage: DealStageKey) => void;
  onAssignOwner?: (owner: string) => void;
  onClear: () => void;
  owners?: string[];
}

export function BulkActionBar({
  selectedCount,
  onMoveToStage,
  onAssignOwner,
  onClear,
  owners = [],
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border bg-white px-4 py-2.5 shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-200">
      <Badge variant="secondary" className="text-sm font-semibold tabular-nums">
        {selectedCount}
      </Badge>
      <span className="text-sm text-gray-600">
        deal{selectedCount > 1 ? "s" : ""} selecionado{selectedCount > 1 ? "s" : ""}
      </span>

      <div className="h-4 w-px bg-gray-200" />

      {/* Move to stage */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="gap-1.5 h-8">
            <IconArrowRight className="h-3.5 w-3.5" />
            Mover para
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {(Object.entries(DEAL_STAGES) as [DealStageKey, typeof DEAL_STAGES[DealStageKey]][]).map(([key, cfg]) => (
            <DropdownMenuItem key={key} onClick={() => onMoveToStage(key)}>
              <div className="h-2.5 w-2.5 rounded-full mr-2" style={{ backgroundColor: cfg.color }} />
              {cfg.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Assign owner */}
      {onAssignOwner && owners.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5 h-8">
              <IconUser className="h-3.5 w-3.5" />
              Atribuir
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {owners.map((owner) => (
              <DropdownMenuItem key={owner} onClick={() => onAssignOwner(owner)}>
                {owner}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClear}>
        <IconX className="h-4 w-4" />
      </Button>
    </div>
  );
}
