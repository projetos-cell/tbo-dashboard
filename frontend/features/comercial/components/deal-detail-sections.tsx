"use client";

import { Badge } from "@/components/ui/badge";
import {
  IconUsers,
  IconNote,
  IconExternalLink,
  IconAlertTriangle,
  IconFolder,
  IconTag,
  IconBell,
  IconMoodSad,
  IconTrendingUp,
} from "@tabler/icons-react";
import { DEAL_STAGES, type DealStageKey, BU_METHOD_PAGES, LANCAMENTO_METHOD_PAGE } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";
import {
  formatCurrency,
  extractValueHistory,
  LOSS_REASONS,
} from "./deal-detail-helpers";
import { DealContactDetails } from "./deal-contact-details";
import { DealLinkedEntities } from "./deal-linked-entities";
import { DealActivityTimeline } from "./deal-activity-timeline";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

interface DealDetailBodyProps {
  deal: DealRow;
}

export function DealDetailBody({ deal }: DealDetailBodyProps) {
  const dealAny = deal as Record<string, unknown>;

  // ── Next action ────────────────────────────────────
  const nextActionDate = dealAny.next_action_date ? String(dealAny.next_action_date) : null;
  const nextActionNote = dealAny.next_action_note ? String(dealAny.next_action_note) : null;
  const isOverdue = nextActionDate ? new Date(nextActionDate) < new Date() : false;

  // ── Loss reason ────────────────────────────────────
  const lossReason = dealAny.loss_reason ? String(dealAny.loss_reason) : null;

  // ── Value history ──────────────────────────────────
  const valueHistory = extractValueHistory(deal.activities);

  // ── Stakeholders ───────────────────────────────────
  const stakeholders = (Array.isArray(dealAny.stakeholders) ? dealAny.stakeholders : []) as Array<{ name: string; role?: string; influence?: string }>;

  // ── Tags ───────────────────────────────────────────
  const tags = (Array.isArray(dealAny.tags) ? dealAny.tags : []) as string[];

  return (
    <div className="px-6 py-5 space-y-6">

      {/* ── Contact + Details (extracted) ──────────── */}
      <DealContactDetails deal={deal} />

      {/* ── Services ─────────────────────────────── */}
      {deal.services && deal.services.length > 0 && (
        <section>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Serviços
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {deal.services.map((s) => (
              <Badge key={s} variant="secondary" className="text-xs font-medium">
                {s}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* ── Nosso Método (BU workflow links) ────── */}
      {(() => {
        const methodLinks = (deal.services ?? [])
          .map((s) => BU_METHOD_PAGES[s])
          .filter(Boolean);
        const dealText = `${deal.name ?? ""} ${deal.notes ?? ""}`.toLowerCase();
        const hasLancamento = dealText.includes("lançamento") || dealText.includes("imobili") || (deal.services ?? []).some((s) => s.toLowerCase().includes("lançamento"));
        if (methodLinks.length === 0 && !hasLancamento) return null;
        return (
          <section>
            <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
              <IconFolder className="h-3.5 w-3.5" strokeWidth={1.5} />
              Nosso Método
            </h4>
            <div className="space-y-1.5">
              {methodLinks.map((m) => (
                <a
                  key={m.slug}
                  href={`/metodo/${m.slug}.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/40"
                >
                  <IconExternalLink className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                  <span className="truncate">{m.label}</span>
                </a>
              ))}
              {hasLancamento && (
                <a
                  href={`/metodo/${LANCAMENTO_METHOD_PAGE.slug}.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50/50 px-4 py-3 text-sm font-medium transition-colors hover:bg-orange-50"
                >
                  <IconExternalLink className="h-4 w-4 text-orange-600 shrink-0" strokeWidth={1.5} />
                  <span className="truncate text-orange-800">{LANCAMENTO_METHOD_PAGE.label}</span>
                </a>
              )}
            </div>
          </section>
        );
      })()}

      {/* ── Next action / follow-up ─────────────── */}
      {(nextActionDate || nextActionNote) && (
        <section>
          <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
            <IconBell className="h-3.5 w-3.5" strokeWidth={1.5} />
            Próxima Ação
          </h4>
          <div className={`rounded-lg border p-3 ${isOverdue ? "border-red-300 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
            <div className="flex items-center gap-2">
              {isOverdue && <IconAlertTriangle className="h-4 w-4 text-red-500 shrink-0" strokeWidth={2} />}
              <div className="flex-1 min-w-0">
                {nextActionDate && (
                  <p className={`text-sm font-semibold ${isOverdue ? "text-red-700" : "text-amber-800"}`}>
                    {new Date(nextActionDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
                    {isOverdue && <span className="ml-1 text-xs font-normal">(atrasado)</span>}
                  </p>
                )}
                {nextActionNote && (
                  <p className={`text-xs mt-0.5 ${isOverdue ? "text-red-600" : "text-amber-700"}`}>
                    {nextActionNote}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Loss reason ───────────────────────────── */}
      {deal.stage === "fechado_perdido" && lossReason && (
        <section>
          <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
            <IconMoodSad className="h-3.5 w-3.5" strokeWidth={1.5} />
            Motivo da Perda
          </h4>
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className={`text-sm font-semibold ${LOSS_REASONS[lossReason]?.color ?? "text-gray-600"}`}>
              {LOSS_REASONS[lossReason]?.label ?? lossReason}
            </p>
          </div>
        </section>
      )}

      {/* ── Tags ─────────────────────────────────── */}
      {tags.length > 0 && (
        <section>
          <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
            <IconTag className="h-3.5 w-3.5" strokeWidth={1.5} />
            Tags
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <Badge key={t} variant="outline" className="text-xs font-medium bg-muted/30">
                {t}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* ── Stakeholders ──────────────────────────── */}
      {stakeholders.length > 0 && (
        <section>
          <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
            <IconUsers className="h-3.5 w-3.5" strokeWidth={1.5} />
            Decisores
          </h4>
          <div className="rounded-lg border bg-muted/20 divide-y">
            {stakeholders.map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {s.name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  {s.role && <p className="text-xs text-muted-foreground">{s.role}</p>}
                </div>
                {s.influence && (
                  <Badge variant="outline" className="text-[10px]">{s.influence}</Badge>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Linked project & contract ────────────── */}
      <DealLinkedEntities dealId={deal.id} company={deal.company} />

      {/* ── Value history ─────────────────────────── */}
      {valueHistory.length > 0 && (
        <section>
          <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
            <IconTrendingUp className="h-3.5 w-3.5" strokeWidth={1.5} />
            Evolução de Valor
          </h4>
          <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
            {valueHistory.map((ev, i) => {
              const stg = DEAL_STAGES[ev.stage as DealStageKey];
              return (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <Badge variant="secondary" className="text-[10px] shrink-0" style={stg ? { backgroundColor: stg.bg, color: stg.color } : undefined}>
                    {stg?.label ?? ev.stage}
                  </Badge>
                  <span className="font-semibold">{formatCurrency(ev.value)}</span>
                  {i > 0 && valueHistory[i - 1].value !== ev.value && (
                    <span className={ev.value > valueHistory[i - 1].value ? "text-green-600" : "text-red-500"}>
                      {ev.value > valueHistory[i - 1].value ? "\u2191" : "\u2193"}
                      {formatCurrency(Math.abs(ev.value - valueHistory[i - 1].value))}
                    </span>
                  )}
                  <span className="ml-auto text-muted-foreground/60 tabular-nums">
                    {new Date(ev.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Notes ────────────────────────────────── */}
      {deal.notes && (
        <section>
          <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
            <IconNote className="h-3.5 w-3.5" strokeWidth={1.5} />
            Observações
          </h4>
          <div className="rounded-lg border bg-muted/20 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {deal.notes}
            </p>
          </div>
        </section>
      )}

      {/* ── Activity Timeline ────────────────────── */}
      <section>
        <DealActivityTimeline dealId={deal.id} rdDealId={deal.rd_deal_id} />
      </section>
    </div>
  );
}
