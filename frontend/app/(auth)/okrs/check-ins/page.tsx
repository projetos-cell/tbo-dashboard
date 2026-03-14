"use client";

import { useState, useMemo } from "react";
import {
  IconChecklist,
  IconArrowRight,
  IconCalendar,
  IconRefresh,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequireRole } from "@/features/auth/components/require-role";
import { ErrorState } from "@/components/shared";
import { useAllCheckins } from "@/features/okrs/hooks/use-okrs";
import type { CheckinWithKr } from "@/features/okrs/services/okrs";

// ── helpers ──────────────────────────────────────────────────────────

function confidenceLabel(value: string | null): { label: string; color: string } {
  const num = parseFloat(value ?? "0");
  if (num >= 0.8) return { label: "Alta", color: "#16a34a" };
  if (num >= 0.5) return { label: "Média", color: "#d97706" };
  if (num >= 0.3) return { label: "Baixa", color: "#dc2626" };
  return { label: "Muito baixa", color: "#dc2626" };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function progressPercent(checkin: CheckinWithKr): number {
  const kr = checkin.okr_key_results;
  if (!kr || !kr.target_value) return 0;
  const target = parseFloat(String(kr.target_value));
  const current = parseFloat(String(checkin.new_value ?? 0));
  if (target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

// ── KPI cards ────────────────────────────────────────────────────────

function CheckinKpis({ checkins }: { checkins: CheckinWithKr[] }) {
  const total = checkins.length;
  const highConfidence = checkins.filter(
    (c) => parseFloat(String(c.confidence ?? "0")) >= 0.8
  ).length;
  const withNotes = checkins.filter((c) => c.notes && c.notes.trim().length > 0).length;
  const uniqueKrs = new Set(checkins.map((c) => c.key_result_id)).size;

  const cards = [
    { label: "Check-ins Registrados", value: total, color: "text-blue-600" },
    { label: "KRs Atualizados", value: uniqueKrs, color: "text-emerald-600" },
    { label: "Confiança Alta", value: highConfidence, color: "text-green-600" },
    { label: "Com Observações", value: withNotes, color: "text-amber-600" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────

function CheckInsContent() {
  const [search, setSearch] = useState("");
  const { data: checkins, isLoading, error, refetch } = useAllCheckins(100);

  const filtered = useMemo(() => {
    if (!checkins) return [];
    if (!search.trim()) return checkins;
    const q = search.toLowerCase();
    return checkins.filter(
      (c) =>
        c.okr_key_results?.title?.toLowerCase().includes(q) ||
        (c.notes ?? "").toLowerCase().includes(q)
    );
  }, [checkins, search]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <IconChecklist className="h-6 w-6" />
            Check-ins
          </h1>
          <p className="text-gray-500 text-sm">
            Acompanhamento periódico de progresso dos Key Results
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <IconRefresh className="h-4 w-4 mr-1" />
          Atualizar
        </Button>
      </div>

      {/* KPIs */}
      {checkins && checkins.length > 0 && <CheckinKpis checkins={checkins} />}

      {/* Search */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar por Key Result ou observação..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        {search && (
          <Button variant="ghost" size="sm" onClick={() => setSearch("")}>
            Limpar
          </Button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <IconChecklist className="h-12 w-12 text-gray-400/40 mb-3" />
            <p className="text-gray-500 mb-2">
              {search
                ? "Nenhum check-in encontrado para esta busca."
                : "Nenhum check-in registrado ainda."}
            </p>
            <p className="text-gray-400 text-xs">
              Faça check-ins nos Key Results para acompanhar o progresso dos OKRs.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              {filtered.length} check-in{filtered.length !== 1 ? "s" : ""} encontrado
              {filtered.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Key Result</TableHead>
                  <TableHead>Atualização</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Confiança</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="pr-4">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((ci) => {
                  const conf = confidenceLabel(ci.confidence);
                  const pct = progressPercent(ci);
                  return (
                    <TableRow key={ci.id}>
                      <TableCell className="pl-4 max-w-[200px]">
                        <p className="font-medium text-sm truncate">
                          {ci.okr_key_results?.title ?? "—"}
                        </p>
                        {ci.okr_key_results?.unit && (
                          <span className="text-xs text-gray-400">
                            {ci.okr_key_results.unit}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-sm">
                          <span className="text-gray-500">{ci.previous_value ?? 0}</span>
                          <IconArrowRight className="h-3 w-3 text-gray-400" />
                          <span className="font-medium">{ci.new_value}</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{pct}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: conf.color, color: conf.color }}
                        >
                          {conf.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="text-xs text-gray-500 truncate block">
                          {ci.notes || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="pr-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <IconCalendar className="h-3 w-3" />
                          {formatDate(ci.created_at)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function CheckInsPage() {
  return (
    <RequireRole minRole="colaborador">
      <CheckInsContent />
    </RequireRole>
  );
}
