"use client";

// Feature #80 — Paginação nas listagens

import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PaginationState {
  page: number;
  pageSize: number;
}

interface DataPaginationProps {
  total: number;
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  labelSingular?: string;
  labelPlural?: string;
}

export function DataPagination({
  total,
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  labelSingular = "item",
  labelPlural = "itens",
}: DataPaginationProps) {
  const { page, pageSize } = pagination;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-4 py-2">
      {/* Count */}
      <p className="text-xs text-muted-foreground">
        {total === 0 ? (
          `0 ${labelPlural}`
        ) : (
          <>
            {from}–{to} de {total} {total === 1 ? labelSingular : labelPlural}
          </>
        )}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Page size */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground hidden sm:inline">Por página</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              onPageSizeChange(Number(v));
              onPageChange(1); // reset to page 1 on size change
            }}
          >
            <SelectTrigger className="h-7 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)} className="text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            aria-label="Primeira página"
          >
            <IconChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Página anterior"
          >
            <IconChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="px-2 text-xs text-muted-foreground">
            {page}/{totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Próxima página"
          >
            <IconChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            aria-label="Última página"
          >
            <IconChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Slice an array based on pagination state */
export function paginateArray<T>(items: T[], { page, pageSize }: PaginationState): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
