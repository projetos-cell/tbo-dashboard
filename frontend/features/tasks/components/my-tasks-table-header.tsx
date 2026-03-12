"use client";

import {
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";

const COLUMNS = [
  { label: "Tarefa", className: "pl-10 flex-1" },
  { label: "Prazo", className: "w-[110px]" },
  { label: "Projeto", className: "w-[140px] hidden lg:table-cell" },
  { label: "Status", className: "w-[130px] hidden sm:table-cell" },
  { label: "Prioridade", className: "w-[120px] hidden sm:table-cell" },
  { label: "Responsável", className: "w-[44px] hidden md:table-cell" },
] as const;

export function MyTasksTableHeader() {
  return (
    <TableHeader className="sticky top-0 z-10 bg-background">
      <TableRow className="hover:bg-transparent border-b-2">
        {COLUMNS.map(({ label, className }, i) => (
          <TableHead
            key={label}
            className={`${className} text-xs font-semibold text-muted-foreground uppercase tracking-wider ${
              i < COLUMNS.length - 1 ? "border-r border-border/40" : ""
            }`}
          >
            {label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}
