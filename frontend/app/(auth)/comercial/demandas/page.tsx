"use client";

import { useState } from "react";
import { IconInbox } from "@tabler/icons-react";
import { EmptyState } from "@/components/shared";
import { DemandsList } from "@/features/demands/components/demands-list";
import { DemandsBoard } from "@/features/demands/components/demands-board";
import {
  DemandsToolbar,
  applyDemandsFilters,
  type DemandsFilters,
} from "@/features/demands/components/demands-toolbar";
import { DemandDetail } from "@/features/demands/components/demand-detail";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";

type DemandRow = Database["public"]["Tables"]["demands"]["Row"];
type SortField = "title" | "due_date" | "prioridade" | "status" | "created_at";

export default function DemandasPage() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  const { data: demands, isLoading } = useQuery({
    queryKey: ["demands", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demands")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DemandRow[];
    },
    enabled: !!tenantId,
  });

  const [filters, setFilters] = useState<DemandsFilters>({
    statuses: [],
    priorities: [],
    bus: [],
    search: "",
  });
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<DemandRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered = applyDemandsFilters(demands ?? [], filters, sortField, sortDir);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Demandas</h1>
        <p className="text-sm text-muted-foreground">
          Solicitacoes e demandas do pipeline comercial
        </p>
      </div>

      <DemandsToolbar
        demands={demands ?? []}
        filters={filters}
        onFiltersChange={setFilters}
        sortField={sortField}
        sortDir={sortDir}
        onSortChange={(field, dir) => {
          setSortField(field as SortField);
          setSortDir(dir);
        }}
        filteredCount={filtered.length}
      />

      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={IconInbox}
          title="Nenhuma demanda encontrada"
          description="Ajuste os filtros ou crie uma nova demanda."
        />
      ) : (
        <DemandsList
          demands={filtered}
          onSelect={(d) => {
            setSelected(d);
            setDetailOpen(true);
          }}
        />
      )}

      <DemandDetail
        demand={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
