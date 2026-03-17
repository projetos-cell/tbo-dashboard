"use client";

import { useState, useMemo } from "react";
import {
  IconBuilding,
  IconRefresh,
  IconMapPin,
  IconCurrencyReal,
  IconHome,
  IconLoader2,
  IconAlertTriangle,
  IconExternalLink,
  IconSearch,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { KPIBig, fmtNum } from "@/features/mercado/components/mercado-page-components";
import { ReportHeader } from "@/features/mercado/components/report-header";
import {
  useOruloBuildings,
  useOruloStates,
  useOruloCities,
  useOruloSync,
} from "@/features/mercado/hooks/use-orulo-data";
import type { OruloBuildingFilters, OruloBuildingListItem } from "@/features/mercado/types/orulo";

const ALL = "__all__";

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    "Em construção": { label: "Em obras", cls: "border-orange-400 bg-orange-50 text-orange-800" },
    "Pronto novo": { label: "Pronto", cls: "bg-emerald-600 text-white" },
    "Pronto Novo": { label: "Pronto", cls: "bg-emerald-600 text-white" },
    Usado: { label: "Usado", cls: "border-gray-400 bg-gray-50 text-gray-800" },
  };
  const found = map[status];
  if (!found) return <Badge variant="outline" className="text-xs">{status}</Badge>;
  return <Badge variant="outline" className={`text-xs ${found.cls}`}>{found.label}</Badge>;
}

function fmtBRL(n: number | undefined): string {
  if (!n) return "—";
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(0)}k`;
  return `R$ ${n.toFixed(0)}`;
}

export default function OruloPage() {
  const { toast } = useToast();

  // ── Filters ──────────────────────────────────────────────
  const [state, setState] = useState("PR");
  const [city, setCity] = useState(ALL);
  const [search, setSearch] = useState("");
  const [finality, setFinality] = useState(ALL);
  const [page, setPage] = useState(1);

  // ── API data ─────────────────────────────────────────────
  const { data: states, isLoading: statesLoading } = useOruloStates();
  const { data: cities, isLoading: citiesLoading } = useOruloCities(state || undefined);

  const filters: OruloBuildingFilters = useMemo(() => {
    const f: OruloBuildingFilters = {
      state: state || undefined,
      results_per_page: 20,
      page,
      last_updated_date_order: "desc",
    };
    if (city !== ALL) f.city = city;
    if (finality === "commercial") f.finality = ["commercial"];
    if (finality === "residential") f.finality = ["residential"];
    return f;
  }, [state, city, finality, page]);

  const {
    data: buildingsData,
    isLoading: buildingsLoading,
    error: buildingsError,
    refetch,
  } = useOruloBuildings(filters, !!state);

  // ── Sync ─────────────────────────────────────────────────
  const syncMutation = useOruloSync();

  const handleSync = () => {
    syncMutation.mutate(undefined, {
      onSuccess: (result) => {
        toast({
          title: "Sincronização concluída",
          description: `${result.buildings_synced} empreendimentos sincronizados em ${(result.duration_ms / 1000).toFixed(1)}s`,
        });
      },
      onError: (err) => {
        toast({
          title: "Erro na sincronização",
          description: err.message,
          variant: "destructive",
        });
      },
    });
  };

  // ── Local search filter ──────────────────────────────────
  const buildings = useMemo(() => {
    if (!buildingsData?.buildings) return [];
    if (!search.trim()) return buildingsData.buildings;
    const q = search.toLowerCase();
    return buildingsData.buildings.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.address?.area?.toLowerCase().includes(q) ||
        b.developer?.name?.toLowerCase().includes(q) ||
        b.publisher?.name?.toLowerCase().includes(q),
    );
  }, [buildingsData?.buildings, search]);

  // ── KPIs ─────────────────────────────────────────────────
  const total = buildingsData?.total ?? 0;
  const totalPages = buildingsData?.total_pages ?? 0;
  const avgPrice =
    buildings.length > 0
      ? buildings.reduce((s, b) => s + (b.min_price ?? 0), 0) / buildings.length
      : 0;
  const avgM2 =
    buildings.length > 0
      ? buildings.reduce((s, b) => s + (b.price_per_private_square_meter ?? 0), 0) /
        buildings.length
      : 0;
  const totalStock = buildings.reduce((s, b) => s + (b.stock ?? 0), 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <ReportHeader
          title="Empreendimentos — Órulo"
          subtitle="Dados em tempo real do catálogo de imóveis via API Órulo"
          sources={[{ label: "API Órulo v2", date: "Tempo real" }]}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={syncMutation.isPending}
          className="flex items-center gap-2"
        >
          {syncMutation.isPending ? (
            <IconLoader2 className="h-4 w-4 animate-spin" />
          ) : (
            <IconRefresh className="h-4 w-4" />
          )}
          Sincronizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar empreendimento, bairro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 pl-9"
          />
        </div>
        <Select value={state} onValueChange={(v) => { setState(v); setCity(ALL); setPage(1); }}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="UF" />
          </SelectTrigger>
          <SelectContent>
            {statesLoading ? (
              <SelectItem value="PR" disabled>Carregando...</SelectItem>
            ) : (
              states?.states?.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <Select value={city} onValueChange={(v) => { setCity(v); setPage(1); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas cidades</SelectItem>
            {citiesLoading ? (
              <SelectItem value="__loading__" disabled>Carregando...</SelectItem>
            ) : (
              cities?.cities?.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <Select value={finality} onValueChange={(v) => { setFinality(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Finalidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas</SelectItem>
            <SelectItem value="residential">Residencial</SelectItem>
            <SelectItem value="commercial">Comercial</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">
          {total} empreendimentos
        </Badge>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="py-4">
          <CardContent>
            {buildingsLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <KPIBig
                icon={IconBuilding}
                label="Empreendimentos"
                value={fmtNum(total)}
                sub={`Página ${page} de ${totalPages}`}
              />
            )}
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            {buildingsLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <KPIBig
                icon={IconHome}
                label="Estoque (página)"
                value={fmtNum(totalStock)}
                sub="unidades disponíveis"
              />
            )}
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            {buildingsLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <KPIBig
                icon={IconCurrencyReal}
                label="Ticket médio"
                value={fmtBRL(avgPrice)}
                sub="preço mínimo médio"
              />
            )}
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            {buildingsLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <KPIBig
                icon={IconMapPin}
                label="R$/m²"
                value={`R$ ${fmtNum(Math.round(avgM2))}`}
                sub="média da página"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {buildingsError && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 py-4">
            <IconAlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Erro ao carregar dados</p>
              <p className="text-xs text-muted-foreground">{buildingsError.message}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-auto">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Empreendimentos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {buildingsLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empreendimento</TableHead>
                  <TableHead>Incorporadora</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Finalidade</TableHead>
                  <TableHead className="text-right">Preço mín.</TableHead>
                  <TableHead className="text-right">R$/m²</TableHead>
                  <TableHead className="text-right">Área</TableHead>
                  <TableHead className="text-right">Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {buildings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                      {buildingsError
                        ? "Erro ao carregar — verifique as credenciais Órulo"
                        : "Nenhum empreendimento encontrado para os filtros selecionados"}
                    </TableCell>
                  </TableRow>
                ) : (
                  buildings.map((b: OruloBuildingListItem) => (
                    <TableRow key={b.id} className="group">
                      <TableCell className="max-w-[200px]">
                        <div className="flex items-center gap-2">
                          {b.default_image?.["200x140"] && (
                            <img
                              src={b.default_image["200x140"]}
                              alt=""
                              className="h-8 w-12 rounded object-cover"
                            />
                          )}
                          <span className="truncate font-medium text-sm" title={b.name}>
                            {b.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {b.publisher?.name ?? b.developer?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {b.address?.area ?? "—"}
                        <span className="text-muted-foreground text-xs ml-1">
                          {b.address?.city}/{b.address?.state}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {b.finality}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {fmtBRL(b.min_price)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {b.price_per_private_square_meter
                          ? `R$ ${fmtNum(Math.round(b.price_per_private_square_meter))}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {b.min_area === b.max_area
                          ? `${b.min_area}m²`
                          : `${b.min_area}–${b.max_area}m²`}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {b.stock ?? "—"}
                      </TableCell>
                      <TableCell>{statusBadge(b.status)}</TableCell>
                      <TableCell>
                        {b.orulo_url && (
                          <a
                            href={b.orulo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <IconExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Fonte: API Órulo v2 · Dados em tempo real
      </p>
    </div>
  );
}
