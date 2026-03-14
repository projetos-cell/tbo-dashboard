"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  IconBuilding,
  IconHome,
  IconCurrencyReal,
  IconChartBar,
} from "@tabler/icons-react";
import {
  LANCAMENTOS,
  INCORPORADORAS,
  TIPOLOGIAS,
  CIDADES,
  STATUS_LABELS,
  type Lancamento,
} from "@/features/mercado/utils/lancamentos-pr-data";
import { fmtNum, fmtPct } from "@/features/mercado/components/mercado-utils";
import { KPIBig } from "@/features/mercado/components/mercado-page-components";
import { ReportHeader } from "@/features/mercado/components/report-header";
import {
  IncorporadorasBarChart,
  TipologiaDonutChart,
} from "@/features/mercado/components/lancamentos-charts";

/* ── Helpers ──────────────────────────────────────────── */

const ALL = "__all__";

function statusBadgeVariant(
  s: Lancamento["status"],
): "default" | "secondary" | "destructive" | "outline" {
  const map: Record<Lancamento["status"], "default" | "secondary" | "destructive" | "outline"> = {
    "pre-lancamento": "outline",
    lancamento: "default",
    "em-obras": "secondary",
    pronto: "default",
  };
  return map[s];
}

function statusBadgeClass(s: Lancamento["status"]): string {
  const map: Record<Lancamento["status"], string> = {
    "pre-lancamento": "border-yellow-400 bg-yellow-50 text-yellow-800",
    lancamento: "bg-blue-600 text-white",
    "em-obras": "border-orange-400 bg-orange-50 text-orange-800",
    pronto: "bg-emerald-600 text-white",
  };
  return map[s];
}

function fmtBRL(n: number): string {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(0)}k`;
  return `R$ ${n}`;
}

/* ── Page ─────────────────────────────────────────────── */

export default function LancamentosPage() {
  const [search, setSearch] = useState("");
  const [cidade, setCidade] = useState(ALL);
  const [tipologia, setTipologia] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [incorporadora, setIncorporadora] = useState(ALL);

  const filtered = useMemo(() => {
    let items = LANCAMENTOS;
    const q = search.toLowerCase().trim();
    if (q) {
      items = items.filter(
        (l) =>
          l.nome.toLowerCase().includes(q) ||
          l.bairro.toLowerCase().includes(q) ||
          l.incorporadora.toLowerCase().includes(q),
      );
    }
    if (cidade !== ALL) items = items.filter((l) => l.cidade === cidade);
    if (tipologia !== ALL) items = items.filter((l) => l.tipologia === tipologia);
    if (status !== ALL) items = items.filter((l) => l.status === status);
    if (incorporadora !== ALL) items = items.filter((l) => l.incorporadora === incorporadora);
    return items;
  }, [search, cidade, tipologia, status, incorporadora]);

  /* KPIs */
  const totalLanc = filtered.length;
  const totalUnidades = filtered.reduce((s, l) => s + l.unidades, 0);
  const vgvEstimado = filtered.reduce(
    (s, l) => s + ((l.precoMin + l.precoMax) / 2) * l.unidades,
    0,
  );
  const vsoMedio =
    totalUnidades > 0
      ? (filtered.reduce((s, l) => s + l.unidadesVendidas, 0) / totalUnidades) * 100
      : 0;

  /* Charts data */
  const incorpCounts = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((l) => map.set(l.incorporadora, (map.get(l.incorporadora) ?? 0) + 1));
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([nome, lancamentos]) => ({ nome, lancamentos }));
  }, [filtered]);

  const tipoCounts = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((l) => map.set(l.tipologia, (map.get(l.tipologia) ?? 0) + 1));
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [filtered]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <ReportHeader
        title="Lançamentos — Paraná"
        subtitle="Tracker de empreendimentos do mercado primário"
        sources={[
          { label: "Dados ilustrativos", date: "Mar 2026" },
          { label: "Órulo API", date: "Em breve" },
        ]}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar empreendimento, bairro..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={cidade} onValueChange={setCidade}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas cidades</SelectItem>
            {CIDADES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={tipologia} onValueChange={setTipologia}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Tipologia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas</SelectItem>
            {TIPOLOGIAS.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            {(Object.keys(STATUS_LABELS) as Lancamento["status"][]).map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={incorporadora} onValueChange={setIncorporadora}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Incorporadora" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas</SelectItem>
            {INCORPORADORAS.map((i) => (
              <SelectItem key={i} value={i}>{i}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="py-4">
          <CardContent>
            <KPIBig icon={IconBuilding} label="Lancamentos" value={String(totalLanc)} sub={`de ${LANCAMENTOS.length} total`} />
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <KPIBig icon={IconHome} label="Unidades totais" value={fmtNum(totalUnidades)} sub={`${fmtNum(filtered.reduce((s, l) => s + l.unidadesVendidas, 0))} vendidas`} />
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <KPIBig icon={IconCurrencyReal} label="VGV estimado" value={fmtBRL(vgvEstimado)} sub="preco medio x unidades" />
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <KPIBig icon={IconChartBar} label="VSO medio" value={fmtPct(vsoMedio)} sub="velocidade sobre oferta" />
          </CardContent>
        </Card>
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Table - 2 cols */}
        <div className="lg:col-span-2 overflow-x-auto">
          <Card className="py-4">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empreendimento</TableHead>
                    <TableHead>Incorporadora</TableHead>
                    <TableHead>Bairro</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">R$/m2</TableHead>
                    <TableHead className="text-right">Unid.</TableHead>
                    <TableHead className="text-right">VSO</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        Nenhum lancamento encontrado para os filtros selecionados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((l) => {
                      const vso = l.unidades > 0
                        ? (l.unidadesVendidas / l.unidades) * 100
                        : 0;
                      return (
                        <TableRow key={l.id} className={l.destaque ? "bg-amber-50/50" : ""}>
                          <TableCell className="font-medium max-w-[200px] truncate" title={l.nome}>
                            {l.nome}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{l.incorporadora}</TableCell>
                          <TableCell className="text-sm">
                            {l.bairro}
                            <span className="text-gray-400 ml-1 text-xs">({l.cidade})</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{l.tipologia}</Badge>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {fmtNum(l.precoM2)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {l.unidadesVendidas}/{l.unidades}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {fmtPct(vso)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={statusBadgeVariant(l.status)}
                              className={statusBadgeClass(l.status)}
                            >
                              {STATUS_LABELS[l.status]}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Charts - 1 col */}
        <div className="space-y-4">
          <IncorporadorasBarChart data={incorpCounts} />
          <TipologiaDonutChart data={tipoCounts} />
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-500">
        Dados ilustrativos — integracao Orulo API em desenvolvimento
      </p>
    </div>
  );
}

