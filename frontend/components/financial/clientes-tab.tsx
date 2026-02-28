"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, DollarSign, AlertTriangle, Clock } from "lucide-react";
import { useFinClients } from "@/hooks/use-financial";
import { computeClientProfiles } from "@/services/financial";
import { formatBRL, formatBRLCompact } from "@/lib/format";
import type { Database } from "@/lib/supabase/types";

type ReceivableRow = Database["public"]["Tables"]["fin_receivables"]["Row"];

interface ClientesTabProps {
  receivables: ReceivableRow[];
  masked?: boolean;
}

function fmt(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function ClientesTab({ receivables, masked = false }: ClientesTabProps) {
  const { data: clients = [] } = useFinClients();

  const profiles = useMemo(
    () => computeClientProfiles(receivables, clients),
    [receivables, clients]
  );

  const totalClients = profiles.length;
  const totalBilled = profiles.reduce((s, p) => s + p.totalBilled, 0);
  const totalOverdue = profiles.reduce((s, p) => s + p.totalOverdue, 0);
  const avgDSO =
    profiles.length > 0
      ? profiles.reduce((s, p) => s + p.avgDSO, 0) / profiles.length
      : 0;

  const top10 = useMemo(
    () =>
      profiles.slice(0, 10).map((p) => ({
        name:
          p.clientName.length > 18
            ? p.clientName.slice(0, 15) + "..."
            : p.clientName,
        faturado: p.totalBilled,
      })),
    [profiles]
  );

  const overdueClients = useMemo(
    () => profiles.filter((p) => p.totalOverdue > 0),
    [profiles]
  );

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-muted-foreground font-medium">
                Total Clientes
              </p>
            </div>
            <p className="text-2xl font-bold">{totalClients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <p className="text-xs text-muted-foreground font-medium">
                Volume Faturado
              </p>
            </div>
            <p className="text-2xl font-bold">
              {masked ? "****" : formatBRLCompact(totalBilled)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <p className="text-xs text-muted-foreground font-medium">
                Inadimplencia Total
              </p>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {masked ? "****" : formatBRLCompact(totalOverdue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <p className="text-xs text-muted-foreground font-medium">
                DSO Medio
              </p>
            </div>
            <p className="text-2xl font-bold">{avgDSO.toFixed(0)} dias</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top 10 bar chart */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3">
              Top 10 Clientes por Faturamento
            </p>
            {top10.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Sem dados de clientes.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(200, top10.length * 36)}>
                <BarChart data={top10} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    type="number"
                    fontSize={11}
                    tickFormatter={(v: number) => fmt(v)}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    fontSize={10}
                    width={120}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    formatter={(value?: number | string) =>
                      masked ? "R$ ****" : fmt(Number(value ?? 0))
                    }
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Bar
                    dataKey="faturado"
                    name="Faturado"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Delinquency section */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3">
              Clientes Inadimplentes ({overdueClients.length})
            </p>
            {overdueClients.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum cliente inadimplente.
              </p>
            ) : (
              <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Cliente</TableHead>
                      <TableHead className="text-xs text-right">
                        Vencido
                      </TableHead>
                      <TableHead className="text-xs text-right">
                        DSO
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overdueClients.map((c) => (
                      <TableRow key={c.clientId ?? "unknown"}>
                        <TableCell className="text-xs truncate max-w-[150px]">
                          {c.clientName}
                        </TableCell>
                        <TableCell className="text-xs text-right text-red-600">
                          {masked ? "****" : formatBRL(c.totalOverdue)}
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          {c.avgDSO.toFixed(0)}d
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full ranking table */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-semibold mb-3">Ranking de Clientes</p>
          {profiles.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Sem dados de clientes.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">#</TableHead>
                    <TableHead className="text-xs">Cliente</TableHead>
                    <TableHead className="text-xs text-right">
                      Total Faturado
                    </TableHead>
                    <TableHead className="text-xs text-right">
                      Total Pago
                    </TableHead>
                    <TableHead className="text-xs text-right">
                      Inadimplente
                    </TableHead>
                    <TableHead className="text-xs text-right">
                      DSO (dias)
                    </TableHead>
                    <TableHead className="text-xs text-right">
                      Concentracao
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((p, i) => (
                    <TableRow key={p.clientId ?? `unknown-${i}`}>
                      <TableCell className="text-xs text-muted-foreground">
                        {i + 1}
                      </TableCell>
                      <TableCell className="text-xs font-medium truncate max-w-[180px]">
                        {p.clientName}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {masked ? "****" : formatBRLCompact(p.totalBilled)}
                      </TableCell>
                      <TableCell className="text-xs text-right text-green-600">
                        {masked ? "****" : formatBRLCompact(p.totalPaid)}
                      </TableCell>
                      <TableCell
                        className={`text-xs text-right ${
                          p.totalOverdue > 0 ? "text-red-600 font-medium" : ""
                        }`}
                      >
                        {masked
                          ? "****"
                          : p.totalOverdue > 0
                            ? formatBRLCompact(p.totalOverdue)
                            : "-"}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {p.avgDSO.toFixed(0)}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {totalBilled > 0
                          ? ((p.totalBilled / totalBilled) * 100).toFixed(1)
                          : "0.0"}
                        %
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
