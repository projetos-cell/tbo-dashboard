"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MeetingsList } from "@/components/meetings/meetings-list";
import { MeetingKPICards } from "@/components/meetings/meeting-kpis";
import { MeetingDetail } from "@/components/meetings/meeting-detail";
import { useMeetings } from "@/hooks/use-meetings";
import { MEETING_STATUS, MEETING_CATEGORIES } from "@/lib/constants";
import { computeMeetingKPIs } from "@/services/meetings";
import type { Database } from "@/lib/supabase/types";

type MeetingRow = Database["public"]["Tables"]["meetings"]["Row"];

export default function ReunioesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRow | null>(
    null
  );

  const { data: meetings = [], isLoading } = useMeetings();

  // Filtered meetings
  const filtered = useMemo(() => {
    let result = meetings;

    if (statusFilter) {
      result = result.filter((m) => m.status === statusFilter);
    }

    if (categoryFilter) {
      result = result.filter((m) => m.category === categoryFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.notes && m.notes.toLowerCase().includes(q)) ||
          (m.summary && m.summary.toLowerCase().includes(q))
      );
    }

    return result;
  }, [meetings, statusFilter, categoryFilter, search]);

  // KPIs from all meetings (not filtered)
  const kpis = useMemo(
    () => computeMeetingKPIs(meetings, {}),
    [meetings]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reunioes</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie reunioes, atas e gravacoes da equipe.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Reuniao
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por titulo, notas, resumo..."
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os status</SelectItem>
            {Object.entries(MEETING_STATUS).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ backgroundColor: cfg.color }}
                  />
                  {cfg.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as categorias</SelectItem>
            {Object.entries(MEETING_CATEGORIES).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ backgroundColor: cfg.color }}
                  />
                  {cfg.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(statusFilter || categoryFilter || search) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter("");
              setCategoryFilter("");
              setSearch("");
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* KPI cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-lg" />
          ))}
        </div>
      ) : (
        <MeetingKPICards kpis={kpis} />
      )}

      {/* Stats */}
      {!isLoading && meetings.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} de {meetings.length} reunioes
        </p>
      )}

      {/* Meetings list */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : (
        <MeetingsList
          meetings={filtered}
          onSelect={(meeting) => setSelectedMeeting(meeting)}
        />
      )}

      {/* Detail drawer */}
      <MeetingDetail
        meeting={selectedMeeting}
        open={!!selectedMeeting}
        onOpenChange={(open) => {
          if (!open) setSelectedMeeting(null);
        }}
      />
    </div>
  );
}
