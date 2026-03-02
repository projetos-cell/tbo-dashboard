"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScoreBadge, TrendIndicator } from "./score-badge";
import { getScoreBand, getStatusIcon } from "@/lib/performance-constants";
import type { PerformanceSnapshotRow } from "@/services/performance";
import { Search, ArrowUpDown } from "lucide-react";

// ---------------------------------------------------------------------------
// Performance Table — sortable, filterable, clickable rows
// ---------------------------------------------------------------------------

type SortField = "name" | "skill_score" | "impact_score" | "culture_score" | "final_score";
type SortDir = "asc" | "desc";

interface PerformanceTableProps {
  snapshots: PerformanceSnapshotRow[];
  getName: (id: string) => string;
  getArea: (id: string) => string;
  getCargo: (id: string) => string;
  isLoading: boolean;
  onSelect: (snapshot: PerformanceSnapshotRow) => void;
}

export function PerformanceTable({
  snapshots,
  getName,
  getArea,
  getCargo,
  isLoading,
  onSelect,
}: PerformanceTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("final_score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    let items = [...snapshots];

    // Search by name
    if (search) {
      const term = search.toLowerCase();
      items = items.filter((s) =>
        getName(s.employee_id).toLowerCase().includes(term)
      );
    }

    // Sort
    items.sort((a, b) => {
      let va: string | number | null;
      let vb: string | number | null;

      switch (sortField) {
        case "name":
          va = getName(a.employee_id);
          vb = getName(b.employee_id);
          break;
        case "skill_score":
          va = a.skill_score;
          vb = b.skill_score;
          break;
        case "impact_score":
          va = a.impact_score;
          vb = b.impact_score;
          break;
        case "culture_score":
          va = a.culture_score;
          vb = b.culture_score;
          break;
        default:
          va = a.final_score;
          vb = b.final_score;
      }

      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;

      if (typeof va === "string" && typeof vb === "string") {
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }

      return sortDir === "asc"
        ? (va as number) - (vb as number)
        : (vb as number) - (va as number);
    });

    return items;
  }, [snapshots, search, sortField, sortDir, getName]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg border bg-muted/40" />
        ))}
      </div>
    );
  }

  const SortableHead = ({ field, label }: { field: SortField; label: string }) => (
    <TableHead
      className="cursor-pointer select-none"
      onClick={() => toggleSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
      </span>
    </TableHead>
  );

  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead field="name" label="Nome" />
              <TableHead>Area</TableHead>
              <TableHead>Cargo</TableHead>
              <SortableHead field="skill_score" label="Skill" />
              <SortableHead field="impact_score" label="Impact" />
              <SortableHead field="culture_score" label="Culture" />
              <SortableHead field="final_score" label="Final" />
              <TableHead className="text-center">Tendencia</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => {
                const band = getScoreBand(s.final_score);

                return (
                  <TableRow
                    key={s.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onSelect(s)}
                  >
                    <TableCell className="font-medium">
                      {getName(s.employee_id)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {getArea(s.employee_id) || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {getCargo(s.employee_id) || "—"}
                    </TableCell>
                    <TableCell>
                      <ScoreBadge score={s.skill_score} />
                    </TableCell>
                    <TableCell>
                      <ScoreBadge score={s.impact_score} />
                    </TableCell>
                    <TableCell>
                      <ScoreBadge score={s.culture_score} />
                    </TableCell>
                    <TableCell>
                      <ScoreBadge score={s.final_score} size="md" />
                    </TableCell>
                    <TableCell className="text-center">
                      <TrendIndicator trend={s.trend} />
                    </TableCell>
                    <TableCell className="text-center">
                      <span title={band.label}>{getStatusIcon(s.final_score)}</span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
