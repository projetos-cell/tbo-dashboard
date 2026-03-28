"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconBookmark,
  IconBookmarkFilled,
  IconPlus,
  IconX,
  IconFilter,
} from "@tabler/icons-react";
import { useSavedFilters, useSaveFilter, useDeleteFilter } from "../hooks/use-task-advanced";
import type { SavedFilter } from "../hooks/use-task-advanced";

interface SavedFiltersBarProps {
  viewKey: string;
  activeFilters: Record<string, unknown>;
  activeFilterId: string | null;
  onSelectFilter: (filter: SavedFilter | null) => void;
}

export function SavedFiltersBar({
  viewKey,
  activeFilters,
  activeFilterId,
  onSelectFilter,
}: SavedFiltersBarProps) {
  const { data: filters, isLoading } = useSavedFilters(viewKey);
  const saveFilter = useSaveFilter(viewKey);
  const deleteFilter = useDeleteFilter(viewKey);

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(false);

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  const handleSave = () => {
    if (!filterName.trim()) return;
    saveFilter.mutate(
      {
        name: filterName.trim(),
        filters: activeFilters,
        is_default: setAsDefault,
      },
      {
        onSuccess: () => {
          setShowSaveDialog(false);
          setFilterName("");
          setSetAsDefault(false);
        },
      },
    );
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteFilter.mutate(id);
    if (activeFilterId === id) {
      onSelectFilter(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <IconFilter size={13} />
        <span>Filtros:</span>
      </div>

      {/* All / Clear */}
      <button
        onClick={() => onSelectFilter(null)}
        className={`inline-flex h-7 items-center rounded-full border px-2.5 text-xs transition-colors ${
          !activeFilterId
            ? "border-foreground bg-foreground text-background"
            : "border-border hover:border-foreground/40 hover:bg-muted/40"
        }`}
      >
        Todos
      </button>

      {/* Saved filter chips */}
      {(filters ?? []).map((filter: SavedFilter) => {
        const isActive = activeFilterId === filter.id;
        return (
          <div
            key={filter.id}
            className={`group inline-flex h-7 items-center rounded-full border transition-colors ${
              isActive
                ? "border-blue-400 bg-blue-50 text-blue-700"
                : "border-border hover:border-muted-foreground/40 hover:bg-muted/40"
            }`}
          >
            <button
              onClick={() => onSelectFilter(isActive ? null : filter)}
              className="flex items-center gap-1.5 px-2.5 text-xs"
            >
              {filter.is_default && (
                <IconBookmarkFilled size={10} className="text-amber-500" />
              )}
              {filter.name}
            </button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => handleDelete(e, filter.id)}
                    className="mr-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <IconX size={11} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Remover filtro</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      })}

      {/* Save current filter */}
      {hasActiveFilters && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowSaveDialog(true)}
                className="inline-flex h-7 items-center gap-1.5 rounded-full border border-dashed border-muted-foreground/40 px-2.5 text-xs text-muted-foreground hover:border-muted-foreground hover:text-foreground transition-colors"
              >
                <IconPlus size={12} />
                Salvar filtro
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Salvar filtros atuais como preset</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Save dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Salvar filtro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Nome do filtro</label>
              <Input
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Ex: Minhas tarefas urgentes"
                className="h-8 text-xs"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="set-default"
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                className="h-3.5 w-3.5 rounded"
              />
              <label htmlFor="set-default" className="flex items-center gap-1 text-xs cursor-pointer">
                <IconBookmark size={12} />
                Definir como padrão
              </label>
            </div>
            <div className="rounded-md bg-muted/60 p-2">
              <p className="text-[10px] text-muted-foreground">
                {Object.keys(activeFilters).length} filtro(s) ativo(s) será(ão) salvo(s)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSaveDialog(false)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="text-xs"
              onClick={handleSave}
              disabled={!filterName.trim() || saveFilter.isPending}
            >
              <IconBookmarkFilled size={12} className="mr-1.5" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
