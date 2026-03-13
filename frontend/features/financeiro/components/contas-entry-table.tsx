"use client";

import { useState } from "react";
import {
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fmt } from "@/features/financeiro/lib/formatters";
import type { OverdueEntry } from "@/features/financeiro/services/finance-types";

const DISPLAY_LIMIT = 20;

/* ── StatusBadge ─────────────────────────────────────── */

export function StatusBadge({ status, daysOverdue, isProjected }: {
  status: string;
  daysOverdue: number;
  isProjected: boolean;
}) {
  if (isProjected) {
    return (
      <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50 text-xs whitespace-nowrap">
        A vencer
      </Badge>
    );
  }
  if (status === "atrasado" || daysOverdue > 0) {
    return (
      <Badge variant="outline" className="text-red-700 border-red-300 bg-red-50 text-xs whitespace-nowrap">
        Vencido
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50 text-xs whitespace-nowrap">
      {status === "provisionado" ? "Provisionado" : "Previsto"}
    </Badge>
  );
}

/* ── DaysBadge ───────────────────────────────────────── */

export function DaysBadge({ days, isProjected }: { days: number; isProjected: boolean }) {
  const getDaysColor = (d: number, proj: boolean) => {
    if (proj) {
      if (d <= -180) return "text-blue-700 bg-blue-100";
      if (d <= -90) return "text-blue-600 bg-blue-50";
      if (d <= -30) return "text-sky-600 bg-sky-50";
      return "text-cyan-700 bg-cyan-50";
    }
    if (d > 90) return "text-red-700 bg-red-100";
    if (d > 60) return "text-red-600 bg-red-50";
    if (d > 30) return "text-orange-600 bg-orange-50";
    return "text-yellow-700 bg-yellow-50";
  };
  return (
    <Badge className={getDaysColor(days, isProjected)}>
      {isProjected ? `${Math.abs(days)}d` : `${days}d`}
    </Badge>
  );
}

/* ── Valor ───────────────────────────────────────────── */

export function Valor({ value, type }: { value: number; type?: "receita" | "despesa" }) {
  const color = type === "receita" ? "text-emerald-600" : type === "despesa" ? "text-red-600" : "";
  return <span className={`font-medium tabular-nums ${color}`}>{fmt(value)}</span>;
}

/* ── EntryTable ──────────────────────────────────────── */

export function EntryTable({
  entries,
  isProjected,
  limit,
}: {
  entries: OverdueEntry[];
  isProjected: boolean;
  limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const cap = limit ?? DISPLAY_LIMIT;
  const visible = expanded ? entries : entries.slice(0, cap);
  const hasMore = entries.length > cap;

  const totalValor = entries.reduce((s, e) => s + e.amount, 0);
  const totalPago = entries.reduce((s, e) => s + e.paid_amount, 0);
  const totalAPagar = entries.reduce(
    (s, e) => s + (e.amount - e.paid_amount - e.omie_desconto + e.omie_juros + e.omie_multa),
    0,
  );

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground text-xs">
              <th className="pb-2 font-medium">Situação</th>
              <th className="pb-2 font-medium">Tipo</th>
              <th className="pb-2 font-medium">Nº Doc</th>
              <th className="pb-2 font-medium">Fornecedor / Cliente</th>
              <th className="pb-2 font-medium">Categoria</th>
              <th className="pb-2 font-medium text-right pr-2">Valor</th>
              <th className="pb-2 font-medium text-right pr-2">Desconto</th>
              <th className="pb-2 font-medium text-right pr-2">Juros+Multa</th>
              <th className="pb-2 font-medium text-right pr-2">Pago</th>
              <th className="pb-2 font-medium text-right pr-2">A Pagar/Receber</th>
              <th className="pb-2 font-medium pl-2">Vencimento</th>
              <th className="pb-2 font-medium text-right">
                {isProjected ? "Prazo" : "Atraso"}
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((entry) => {
              const valorAPagar = entry.amount - entry.paid_amount - entry.omie_desconto + entry.omie_juros + entry.omie_multa;
              return (
                <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="py-1.5">
                    <StatusBadge
                      status={entry.status}
                      daysOverdue={entry.days_overdue}
                      isProjected={entry.isProjected}
                    />
                  </td>
                  <td className="py-1.5">
                    <Badge
                      variant="outline"
                      className={
                        entry.type === "receita"
                          ? "text-emerald-700 border-emerald-300 bg-emerald-50 text-xs"
                          : "text-red-700 border-red-300 bg-red-50 text-xs"
                      }
                    >
                      {entry.type === "receita" ? "AR" : "AP"}
                    </Badge>
                  </td>
                  <td className="py-1.5 text-xs text-muted-foreground font-mono">
                    {entry.omie_num_titulo || "—"}
                  </td>
                  <td className="py-1.5 max-w-[180px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="truncate text-sm">
                            {entry.counterpart || entry.description || "Sem identificação"}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="font-medium">{entry.counterpart || entry.description || "—"}</p>
                          {entry.counterpart_doc && (
                            <p className="text-xs text-muted-foreground">{entry.counterpart_doc}</p>
                          )}
                          {entry.description && (
                            <p className="text-xs mt-1">{entry.description}</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className="py-1.5 text-xs text-muted-foreground max-w-[120px] truncate" title={entry.category_name ?? ""}>
                    {entry.category_name ?? "—"}
                  </td>
                  <td className="py-1.5 text-right pr-2">
                    <Valor value={entry.amount} type={entry.type} />
                  </td>
                  <td className="py-1.5 text-right pr-2 text-xs text-muted-foreground tabular-nums">
                    {entry.omie_desconto > 0 ? fmt(entry.omie_desconto) : "—"}
                  </td>
                  <td className="py-1.5 text-right pr-2 text-xs tabular-nums">
                    {(entry.omie_juros + entry.omie_multa) > 0 ? (
                      <span className="text-orange-600">
                        {fmt(entry.omie_juros + entry.omie_multa)}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="py-1.5 text-right pr-2 text-xs text-muted-foreground tabular-nums">
                    {entry.paid_amount > 0 ? fmt(entry.paid_amount) : "—"}
                  </td>
                  <td className="py-1.5 text-right pr-2">
                    <Valor value={Math.max(0, valorAPagar)} type={entry.type} />
                  </td>
                  <td className="py-1.5 text-muted-foreground pl-2 text-xs whitespace-nowrap">
                    {new Date(entry.due_date + "T00:00:00").toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-1.5 text-right">
                    <DaysBadge days={entry.days_overdue} isProjected={entry.isProjected} />
                  </td>
                </tr>
              );
            })}
          </tbody>
          {visible.length > 0 && (
            <tfoot>
              <tr className="border-t bg-muted/30 font-medium text-xs">
                <td colSpan={5} className="py-2 text-muted-foreground">
                  {entries.length} título{entries.length !== 1 ? "s" : ""}
                </td>
                <td className="py-2 text-right pr-2 tabular-nums">{fmt(totalValor)}</td>
                <td />
                <td />
                <td className="py-2 text-right pr-2 tabular-nums text-muted-foreground">
                  {totalPago > 0 ? fmt(totalPago) : ""}
                </td>
                <td className="py-2 text-right pr-2 tabular-nums font-bold">{fmt(Math.max(0, totalAPagar))}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {hasMore && (
        <div className="flex justify-center pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {expanded ? (
              <>
                <IconChevronUp className="size-3.5 mr-1" />
                Mostrar menos
              </>
            ) : (
              <>
                <IconChevronDown className="size-3.5 mr-1" />
                Ver todos ({entries.length - cap} restantes)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
