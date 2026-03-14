"use client";

import {
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortField = "title" | "due_date" | "prioridade" | "status" | "created_at";

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "due_date", label: "Prazo" },
  { value: "title", label: "Titulo" },
  { value: "prioridade", label: "Prioridade" },
  { value: "status", label: "Status" },
  { value: "created_at", label: "Data de criacao" },
];

interface DemandSortDropdownProps {
  sortField: SortField;
  sortDir: "asc" | "desc";
  onSortChange: (field: SortField, dir: "asc" | "desc") => void;
}

export function DemandSortDropdown({
  sortField,
  sortDir,
  onSortChange,
}: DemandSortDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          {sortDir === "asc" ? (
            <IconSortAscendingLetters className="size-3.5" />
          ) : (
            <IconSortDescendingLetters className="size-3.5" />
          )}
          {SORT_OPTIONS.find((o) => o.value === sortField)?.label ?? "Ordenar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        {SORT_OPTIONS.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt.value}
            checked={sortField === opt.value}
            onCheckedChange={() =>
              onSortChange(
                opt.value,
                sortField === opt.value && sortDir === "asc" ? "desc" : "asc"
              )
            }
          >
            {opt.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
