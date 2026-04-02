"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import {
  IconBuilding,
  IconMapPin,
  IconCurrencyReal,
  IconHome,
  IconSearch,
  IconUpload,
  IconPhone,
  IconMail,
  IconExternalLink,
  IconLoader2,
  IconAlertTriangle,
  IconBrandWhatsapp,
  IconFileText,
  IconCheck,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { KPIBig, fmtNum } from "@/features/mercado/components/mercado-page-components";
import { ReportHeader } from "@/features/mercado/components/report-header";
import {
  useOruloCSVBuildings,
  useOruloCSVStats,
  useOruloCSVImport,
} from "@/features/mercado/hooks/use-orulo-data";
import { createClient } from "@/lib/supabase/client";
import { useTenantSafe } from "@/hooks/use-tenant";

const ALL = "__all__";
const PAGE_SIZE = 30;

/** Shape of a row from orulo_buildings (csv_import) */
interface OruloCSVBuilding {
  id: string;
  orulo_id: string;
  name: string | null;
  status: string | null;
  description: string | null;
  street: string | null;
  area: string | null;
  city: string | null;
  state: string | null;
  min_price: number | null;
  max_price: number | null;
  min_area: number | null;
  max_area: number | null;
  min_bedrooms: number | null;
  min_suites: number | null;
  min_parking: number | null;
  total_units: number | null;
  stock: number | null;
  developer_name: string | null;
  orulo_url: string | null;
  webpage: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_whatsapp: string | null;
  commission_pj: number | null;
  commission_pf: number | null;
  documents: Record<string, string[]> | null;
  import_region: string | null;
  data_source: string;
}

const REGIONS = [
  { value: ALL, label: "Todas regiões" },
  { value: "sp", label: "São Paulo" },
  { value: "rj", label: "Rio de Janeiro" },
  { value: "pr", label: "Paraná" },
  { value: "curitiba", label: "Curitiba" },
  { value: "sc", label: "Santa Catarina" },
] as const;

function statusBadge(status: string | null) {
  if (!status) return <Badge variant="outline" className="text-xs">—</Badge>;
  const map: Record<string, { label: string; cls: string }> = {
    "Em construção": { label: "Em obras", cls: "border-orange-400 bg-orange-50 text-orange-800" },
    "Pronto novo": { label: "Pronto", cls: "bg-emerald-600 text-white" },
    "Pronto Novo": { label: "Pronto", cls: "bg-emerald-600 text-white" },
    Usado: { label: "Usado", cls: "border-gray-400 bg-gray-50 text-gray-800" },
    Lançamento: { label: "Lançamento", cls: "bg-blue-600 text-white" },
  };
  const found = map[status];
  if (!found) return <Badge variant="outline" className="text-xs">{status}</Badge>;
  return <Badge variant="outline" className={`text-xs ${found.cls}`}>{found.label}</Badge>;
}

function fmtBRL(n: number | null | undefined): string {
  if (!n) return "—";
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(0)}k`;
  return `R$ ${n.toFixed(0)}`;
}

function regionLabel(region: string): string {
  return REGIONS.find((r) => r.value === region)?.label || region.toUpperCase();
}

// ---------------------------------------------------------------------------
// Import Dialog
// ---------------------------------------------------------------------------

function ImportDialog({ tenantId }: { tenantId: string }) {
  const { toast } = useToast();
  const importMutation = useOruloCSVImport();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedRegion, setSelectedRegion] = useState("sp");
  const [results, setResults] = useState<Array<{ region: string; status: string; imported: number }>>([]);

  const handleFileUpload = useCallback(async () => {
    const files = fileRef.current?.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const text = await file.text();

      // Auto-detect region from filename
      let region = selectedRegion;
      const fname = file.name.toLowerCase();
      if (fname.includes("curitiba")) region = "curitiba";
      else if (fname.includes("_pr")) region = "pr";
      else if (fname.includes("_rj")) region = "rj";
      else if (fname.includes("_sc")) region = "sc";
      else if (fname.includes("_sp")) region = "sp";

      try {
        const result = await importMutation.mutateAsync({
          csvData: text,
          region,
          tenantId,
        });

        setResults((prev) => [
          ...prev,
          { region, status: result.status, imported: result.imported },
        ]);

        toast({
          title: `${regionLabel(region)} importado`,
          description: `${result.imported} empreendimentos de ${result.total_rows} linhas`,
        });
      } catch (err) {
        toast({
          title: `Erro ao importar ${file.name}`,
          description: err instanceof Error ? err.message : "Erro desconhecido",
          variant: "destructive",
        });
      }
    }

    if (fileRef.current) fileRef.current.value = "";
  }, [selectedRegion, tenantId, importMutation, toast]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <IconUpload className="h-4 w-4" />
          Importar CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar CSVs Órulo</DialogTitle>
          <DialogDescription>
            Selecione os arquivos CSV exportados do Órulo. A região é detectada
            automaticamente pelo nome do arquivo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="flex gap-3">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Região padrão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sp">São Paulo</SelectItem>
                <SelectItem value="rj">Rio de Janeiro</SelectItem>
                <SelectItem value="pr">Paraná</SelectItem>
                <SelectItem value="curitiba">Curitiba</SelectItem>
                <SelectItem value="sc">Santa Catarina</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1">
              <Input
                ref={fileRef}
                type="file"
                accept=".csv"
                multiple
                className="cursor-pointer"
              />
            </div>
          </div>

          <Button
            onClick={handleFileUpload}
            disabled={importMutation.isPending}
            className="w-full"
          >
            {importMutation.isPending ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <IconUpload className="mr-2 h-4 w-4" />
                Importar arquivos
              </>
            )}
          </Button>

          {results.length > 0 && (
            <div className="space-y-2 rounded-lg border p-3">
              <p className="text-xs font-medium text-muted-foreground">Resultados:</p>
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {r.status === "success" ? (
                    <IconCheck className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <IconAlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="font-medium">{regionLabel(r.region)}</span>
                  <span className="text-muted-foreground">— {r.imported} empreendimentos</span>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Formato esperado: CSV com delimitador <code>;</code> e encoding UTF-8.
            Colunas: ID, Nome, Incorporadora, Bairro, Cidade, UF, Endereco, Status, etc.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function CatalogoRegionalPage() {
  const [supabase] = useState(() => createClient());
  const tenantId = useTenantSafe();
  const { toast } = useToast();

  // Filters
  const [region, setRegion] = useState(ALL);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      region: region !== ALL ? region : undefined,
      status: status !== ALL ? status : undefined,
      search: search.trim() || undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    [region, status, search, page],
  );

  const {
    data: buildingsData,
    isLoading,
    error,
    refetch,
  } = useOruloCSVBuildings(supabase, tenantId ?? undefined, filters);

  const { data: stats } = useOruloCSVStats(supabase, tenantId ?? undefined);

  const buildings = (buildingsData?.buildings ?? []) as OruloCSVBuilding[];
  const total = buildingsData?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // KPIs
  const totalAll = stats?.total ?? 0;
  const avgPrice =
    buildings.length > 0
      ? buildings.reduce((s, b) => s + (b.min_price ?? 0), 0) / buildings.length
      : 0;
  const totalStock = buildings.reduce((s, b) => s + (b.stock ?? 0), 0);
  const regionCount = stats?.byRegion ? Object.keys(stats.byRegion).length : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <ReportHeader
          title="Catálogo Regional — Órulo"
          subtitle="Base completa de empreendimentos importados via CSV — SP, RJ, PR, SC"
          sources={[{ label: "CSVs Órulo", date: "Abril 2026" }]}
        />
        {tenantId && <ImportDialog tenantId={tenantId} />}
      </div>

      {/* Region chips */}
      {stats?.byRegion && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.byRegion)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([reg, data]) => (
              <button
                key={reg}
                onClick={() => {
                  setRegion(region === reg ? ALL : reg);
                  setPage(1);
                }}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  region === reg
                    ? "border-primary bg-primary/10 text-primary"
                    : "hover:border-primary/30"
                }`}
              >
                <IconMapPin className="h-3 w-3" />
                <span className="font-medium">{regionLabel(reg)}</span>
                <Badge variant="secondary" className="text-[10px] px-1.5">
                  {data.count}
                </Badge>
              </button>
            ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar empreendimento, bairro, cidade..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-72 pl-9"
          />
        </div>
        <Select value={region} onValueChange={(v) => { setRegion(v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Região" />
          </SelectTrigger>
          <SelectContent>
            {REGIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            <SelectItem value="Pronto novo">Pronto novo</SelectItem>
            <SelectItem value="Em construção">Em construção</SelectItem>
            <SelectItem value="Lançamento">Lançamento</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">
          {total} de {totalAll} empreendimentos
        </Badge>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="py-4">
          <CardContent>
            {isLoading ? <Skeleton className="h-16 w-full" /> : (
              <KPIBig icon={IconBuilding} label="Empreendimentos" value={fmtNum(total)} sub={`${regionCount} regiões`} />
            )}
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            {isLoading ? <Skeleton className="h-16 w-full" /> : (
              <KPIBig icon={IconHome} label="Estoque total" value={fmtNum(totalStock)} sub="unidades disponíveis" />
            )}
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            {isLoading ? <Skeleton className="h-16 w-full" /> : (
              <KPIBig icon={IconCurrencyReal} label="Ticket médio" value={fmtBRL(avgPrice)} sub="preço mínimo médio" />
            )}
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            {isLoading ? <Skeleton className="h-16 w-full" /> : (
              <KPIBig
                icon={IconMapPin}
                label="Regiões"
                value={String(regionCount)}
                sub="SP, RJ, PR, CWB, SC"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 py-4">
            <IconAlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Erro ao carregar dados</p>
              <p className="text-xs text-muted-foreground">{error.message}</p>
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
            Empreendimentos importados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empreendimento</TableHead>
                    <TableHead>Incorporadora</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead className="text-right">Preço mín.</TableHead>
                    <TableHead className="text-right">Área</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead className="text-right">Comissão</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buildings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                        {totalAll === 0
                          ? "Nenhum CSV importado ainda — use o botão Importar CSV acima"
                          : "Nenhum empreendimento encontrado para os filtros selecionados"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    buildings.map((b) => (
                      <TableRow key={b.id} className="group">
                        <TableCell className="max-w-[200px]">
                          <div>
                            <span className="truncate font-medium text-sm block" title={b.name ?? ""}>
                              {b.name}
                            </span>
                            <Badge variant="outline" className="text-[9px] mt-0.5">
                              {regionLabel(b.import_region || "")}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[140px] truncate">
                          {b.developer_name ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {b.area ?? "—"}
                          <span className="text-muted-foreground text-xs ml-1">
                            {b.city}/{b.state}
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm">
                          {fmtBRL(b.min_price)}
                          {b.max_price ? (
                            <span className="text-muted-foreground text-xs block">
                              até {fmtBRL(b.max_price)}
                            </span>
                          ) : null}
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
                          <div className="flex items-center gap-1">
                            {b.contact_name ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-xs text-muted-foreground truncate max-w-[80px] block cursor-help">
                                    {b.contact_name}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="space-y-1">
                                  <p className="font-medium">{b.contact_name}</p>
                                  {b.contact_phone ? (
                                    <p className="flex items-center gap-1 text-xs">
                                      <IconPhone className="h-3 w-3" /> {b.contact_phone}
                                    </p>
                                  ) : null}
                                  {b.contact_email ? (
                                    <p className="flex items-center gap-1 text-xs">
                                      <IconMail className="h-3 w-3" /> {b.contact_email}
                                    </p>
                                  ) : null}
                                  {b.contact_whatsapp ? (
                                    <p className="flex items-center gap-1 text-xs">
                                      <IconBrandWhatsapp className="h-3 w-3" /> {b.contact_whatsapp}
                                    </p>
                                  ) : null}
                                </TooltipContent>
                              </Tooltip>
                            ) : null}
                            {b.contact_whatsapp ? (
                              <a
                                href={`https://wa.me/${b.contact_whatsapp.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-700"
                              >
                                <IconBrandWhatsapp className="h-3.5 w-3.5" />
                              </a>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-xs tabular-nums">
                          {b.commission_pj ? (
                            <span title="PJ">{b.commission_pj}%</span>
                          ) : b.commission_pf ? (
                            <span title="PF">{b.commission_pf}%</span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {b.documents && Object.keys(b.documents).length > 0 ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <IconFileText className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs font-medium mb-1">Documentos:</p>
                                  {Object.entries(b.documents).map(([type, files]) => (
                                    <p key={type} className="text-xs">{type}: {files.length} arquivo(s)</p>
                                  ))}
                                </TooltipContent>
                              </Tooltip>
                            ) : null}
                            {b.orulo_url ? (
                              <a
                                href={b.orulo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <IconExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              </a>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TooltipProvider>
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
        Fonte: CSVs exportados do Órulo · Dados estáticos importados
      </p>
    </div>
  );
}
