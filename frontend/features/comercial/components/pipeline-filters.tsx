"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RdPipelineStage } from "@/features/comercial/services/commercial";

interface PipelineFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  stageFilter: string;
  onStageChange: (v: string) => void;
  ownerFilter: string;
  onOwnerChange: (v: string) => void;
  stages: RdPipelineStage[];
  owners: string[];
}

export function PipelineFilters({
  search,
  onSearchChange,
  stageFilter,
  onStageChange,
  ownerFilter,
  onOwnerChange,
  stages,
  owners,
}: PipelineFiltersProps) {
  const hasActiveFilters = !!stageFilter || !!ownerFilter || !!search;

  function clearAll() {
    onSearchChange("");
    onStageChange("");
    onOwnerChange("");
  }

  const orderedStages = [...stages].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Buscar deals..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {owners.length > 0 && (
          <Select value={ownerFilter || "__all__"} onValueChange={(v) => onOwnerChange(v === "__all__" ? "" : v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos os responsáveis</SelectItem>
              {owners.map((owner) => (
                <SelectItem key={owner} value={owner}>
                  {owner}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-gray-500"
          >
            <X className="mr-1 h-3 w-3" />
            Limpar filtros
          </Button>
        )}
      </div>

      {orderedStages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={stageFilter === "" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onStageChange("")}
          >
            Todas as etapas
          </Badge>
          {orderedStages.map((stage) => (
            <Badge
              key={stage.id}
              variant={stageFilter === stage.id ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onStageChange(stage.id)}
            >
              {stage.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
