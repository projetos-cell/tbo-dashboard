"use client";

import { formatCurrency } from "@/features/comercial/lib/format-currency";
import { fmtPct } from "./comercial-chart-utils";
import type {
  ClientData,
  OwnerData,
} from "@/features/comercial/services/commercial-analytics";

// ── Client Ranking Table ───────────────────────────────────────────────────────

export function ClientRankingTable({ data }: { data: ClientData[] }) {
  if (!data.length) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Sem dados de clientes.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">#</th>
            <th className="pb-2 pr-4 font-medium">Cliente</th>
            <th className="pb-2 pr-4 text-right font-medium">Propostas</th>
            <th className="pb-2 pr-4 text-right font-medium">Convertidas</th>
            <th className="pb-2 pr-4 text-right font-medium">Conversao</th>
            <th className="pb-2 pr-4 text-right font-medium">Orcado</th>
            <th className="pb-2 pr-4 text-right font-medium">Faturado</th>
            <th className="pb-2 text-right font-medium">Participacao</th>
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 15).map((c, i) => (
            <tr key={c.name} className="border-b last:border-0">
              <td className="py-2 pr-4 text-xs text-muted-foreground">
                {i + 1}
              </td>
              <td className="py-2 pr-4 font-medium">{c.name}</td>
              <td className="py-2 pr-4 text-right tabular-nums">
                {c.proposals}
              </td>
              <td className="py-2 pr-4 text-right tabular-nums">
                {c.converted}
              </td>
              <td className="py-2 pr-4 text-right tabular-nums">
                {fmtPct(c.conversionRate)}
              </td>
              <td className="py-2 pr-4 text-right tabular-nums">
                {formatCurrency(c.quoted)}
              </td>
              <td className="py-2 pr-4 text-right tabular-nums font-medium">
                {formatCurrency(c.billed)}
              </td>
              <td className="py-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(c.participation, 100)}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                    {fmtPct(c.participation)}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Owners Performance Table ───────────────────────────────────────────────────

export function OwnersTable({ data }: { data: OwnerData[] }) {
  if (!data.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Vendedor</th>
            <th className="pb-2 pr-4 text-right font-medium">Deals</th>
            <th className="pb-2 pr-4 text-right font-medium">Ganhos</th>
            <th className="pb-2 pr-4 text-right font-medium">Conversao</th>
            <th className="pb-2 text-right font-medium">Faturado</th>
          </tr>
        </thead>
        <tbody>
          {data.map((o) => (
            <tr key={o.name} className="border-b last:border-0">
              <td className="py-2 pr-4 font-medium">{o.name}</td>
              <td className="py-2 pr-4 text-right tabular-nums">{o.deals}</td>
              <td className="py-2 pr-4 text-right tabular-nums">{o.won}</td>
              <td className="py-2 pr-4 text-right tabular-nums">
                {fmtPct(o.conversionRate)}
              </td>
              <td className="py-2 text-right tabular-nums font-medium">
                {formatCurrency(o.billed)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
