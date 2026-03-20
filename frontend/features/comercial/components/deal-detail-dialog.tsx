"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  IconCurrencyDollar,
  IconCalendar,
  IconBuilding,
  IconUser,
  IconUsers,
  IconMail,
  IconPhone,
  IconTarget,
  IconGitBranch,
  IconClock,
  IconMessage,
  IconNote,
  IconCheckbox,
  IconTrophy,
  IconX as IconXMark,
  IconEdit,
  IconPercentage,
  IconCopy,
  IconExternalLink,
  IconBriefcase,
  IconFlame,
  IconSnowflake,
  IconSun,
  IconAlertTriangle,
  IconLink,
  IconFolder,
  IconFileText,
  IconTag,
  IconBell,
  IconMoodSad,
  IconArrowRight,
  IconTrendingUp,
} from "@tabler/icons-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import { DEAL_STAGES, type DealStageKey, BU_METHOD_PAGES, LANCAMENTO_METHOD_PAGE } from "@/lib/constants";
import { toast } from "sonner";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

interface DealActivity {
  id: string;
  type: string;
  title: string | null;
  content: string | null;
  author_name: string | null;
  occurred_at: string;
  metadata: Record<string, unknown>;
}

interface DealDetailDialogProps {
  deal: DealRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (deal: DealRow) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Copiado!");
}

const ACTIVITY_ICONS: Record<string, typeof IconMessage> = {
  note: IconNote,
  call: IconPhone,
  email: IconMail,
  meeting: IconCalendar,
  task: IconCheckbox,
  won: IconTrophy,
  lost: IconXMark,
  creation: IconGitBranch,
  stage_change: IconGitBranch,
  comment: IconMessage,
  activity: IconMessage,
};

const ACTIVITY_LABELS: Record<string, string> = {
  note: "Nota",
  call: "Ligação",
  email: "E-mail",
  meeting: "Reunião",
  task: "Tarefa",
  won: "Ganho",
  lost: "Perdido",
  creation: "Criação",
  stage_change: "Mudança de etapa",
  comment: "Comentário",
  activity: "Atividade",
};

const ACTIVITY_COLORS: Record<string, string> = {
  note: "bg-amber-100 text-amber-700",
  call: "bg-blue-100 text-blue-700",
  email: "bg-violet-100 text-violet-700",
  meeting: "bg-emerald-100 text-emerald-700",
  task: "bg-cyan-100 text-cyan-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
  creation: "bg-gray-100 text-gray-600",
  stage_change: "bg-indigo-100 text-indigo-700",
  comment: "bg-slate-100 text-slate-700",
  activity: "bg-slate-100 text-slate-700",
};

// ── Probability bar color ────────────────────────────────

function getProbabilityColor(p: number) {
  if (p >= 80) return "bg-green-500";
  if (p >= 50) return "bg-amber-500";
  if (p >= 20) return "bg-orange-500";
  return "bg-red-400";
}

// ── #1 Time in stage ─────────────────────────────────────

function getDaysInStage(updatedAt: string | null): number {
  if (!updatedAt) return 0;
  const diff = Date.now() - new Date(updatedAt).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getStageTimeColor(days: number) {
  if (days <= 7) return "text-green-600 bg-green-50";
  if (days <= 14) return "text-amber-600 bg-amber-50";
  if (days <= 30) return "text-orange-600 bg-orange-50";
  return "text-red-600 bg-red-50";
}

// ── #2 Temperature score ─────────────────────────────────

function getTemperature(deal: { probability?: number | null; value?: number | null; updated_at?: string | null }): { label: string; icon: typeof IconFlame; color: string; bg: string } {
  const prob = deal.probability ?? 0;
  const val = Number(deal.value) || 0;
  const days = getDaysInStage(deal.updated_at ?? null);

  let score = 0;
  if (prob >= 70) score += 3;
  else if (prob >= 40) score += 2;
  else if (prob >= 20) score += 1;

  if (val >= 80000) score += 2;
  else if (val >= 30000) score += 1;

  if (days <= 7) score += 2;
  else if (days <= 14) score += 1;
  else if (days > 30) score -= 1;

  if (score >= 5) return { label: "Quente", icon: IconFlame, color: "text-red-600", bg: "bg-red-50 border-red-200" };
  if (score >= 3) return { label: "Morno", icon: IconSun, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
  return { label: "Frio", icon: IconSnowflake, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" };
}

// ── #7 Value history extraction ──────────────────────────

interface ValueEvent { stage: string; value: number; date: string }

function extractValueHistory(activities: unknown): ValueEvent[] {
  if (!Array.isArray(activities)) return [];
  const events: ValueEvent[] = [];
  for (const a of activities) {
    const act = a as Record<string, unknown>;
    if (act.type === "stage_change" && act.to && act.date) {
      const val = typeof act.closed_value === "number" ? act.closed_value : null;
      if (val != null) {
        events.push({ stage: String(act.to), value: val, date: String(act.date) });
      }
    }
  }
  return events;
}

// ── #4 Loss reason labels ────────────────────────────────

const LOSS_REASONS: Record<string, { label: string; color: string }> = {
  preco: { label: "Preço", color: "text-red-600" },
  timing: { label: "Timing", color: "text-amber-600" },
  concorrencia: { label: "Concorrência", color: "text-orange-600" },
  escopo: { label: "Escopo", color: "text-violet-600" },
  sem_resposta: { label: "Sem resposta", color: "text-gray-600" },
  outro: { label: "Outro", color: "text-gray-500" },
};

// ── Main Component ───────────────────────────────────────

export function DealDetailDialog({
  deal,
  open,
  onOpenChange,
  onEdit,
}: DealDetailDialogProps) {
  if (!deal) return null;

  const dealAny = deal as Record<string, unknown>;
  const contactPhone = dealAny.contact_phone ? String(dealAny.contact_phone) : null;
  const rdPipelineName = dealAny.rd_pipeline_name ? String(dealAny.rd_pipeline_name) : null;
  const rdStageName = dealAny.rd_stage_name ? String(dealAny.rd_stage_name) : null;

  const stageConfig =
    DEAL_STAGES[deal.stage as DealStageKey] ?? {
      label: deal.stage,
      color: "#6b7280",
      bg: "rgba(107,114,128,0.12)",
    };

  const probability = deal.probability ?? 0;
  const value = Number(deal.value) || 0;

  // ── #1 Time in stage ──────────────────────────────────
  const daysInStage = getDaysInStage(deal.updated_at);
  const stageTimeColor = getStageTimeColor(daysInStage);

  // ── #2 Temperature ────────────────────────────────────
  const temp = getTemperature(deal);
  const TempIcon = temp.icon;

  // ── #3 Next action ────────────────────────────────────
  const nextActionDate = dealAny.next_action_date ? String(dealAny.next_action_date) : null;
  const nextActionNote = dealAny.next_action_note ? String(dealAny.next_action_note) : null;
  const isOverdue = nextActionDate ? new Date(nextActionDate) < new Date() : false;

  // ── #4 Loss reason ────────────────────────────────────
  const lossReason = dealAny.loss_reason ? String(dealAny.loss_reason) : null;

  // ── #7 Value history ──────────────────────────────────
  const valueHistory = extractValueHistory(deal.activities);

  // ── #9 Stakeholders ───────────────────────────────────
  const stakeholders = (Array.isArray(dealAny.stakeholders) ? dealAny.stakeholders : []) as Array<{ name: string; role?: string; influence?: string }>;

  // ── #10 Tags ──────────────────────────────────────────
  const tags = (Array.isArray(dealAny.tags) ? dealAny.tags : []) as string[];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-0 sm:max-w-[480px] flex flex-col">
        {/* ── Header ──────────────────────────────────── */}
        <div className="border-b bg-muted/30 px-6 pt-6 pb-5">
          <SheetHeader className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-lg font-bold leading-tight text-left">
                  {deal.name}
                </SheetTitle>
                <SheetDescription className="sr-only">Detalhes do deal</SheetDescription>
              </div>
              {onEdit && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0"
                      onClick={() => onEdit(deal)}
                    >
                      <IconEdit className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Editar deal</TooltipContent>
                </Tooltip>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="secondary"
                className="font-semibold"
                style={{
                  backgroundColor: stageConfig.bg,
                  color: stageConfig.color,
                }}
              >
                {stageConfig.label}
              </Badge>
              {/* #1 Time in stage */}
              <Badge variant="outline" className={`text-[10px] font-semibold ${stageTimeColor}`}>
                {daysInStage}d neste stage
              </Badge>
              {/* #2 Temperature */}
              <Badge variant="outline" className={`text-[10px] font-semibold gap-1 ${temp.bg}`}>
                <TempIcon className="h-3 w-3" strokeWidth={2} />
                {temp.label}
              </Badge>
              {deal.priority && (
                <Badge variant="outline" className="capitalize text-xs">
                  {deal.priority}
                </Badge>
              )}
              {deal.source && deal.source !== "manual" && (
                <Badge variant="outline" className="text-xs">
                  {deal.source}
                </Badge>
              )}
            </div>
          </SheetHeader>

          {/* ── Value + Probability hero ─────────────── */}
          {value > 0 && (
            <div className="mt-4 rounded-xl border bg-background p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold tracking-tight text-foreground">
                  {formatCurrency(value)}
                </span>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <IconPercentage className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span className="font-semibold">{probability}%</span>
                </div>
              </div>
              {/* Probability bar */}
              <div className="mt-2.5 h-1.5 w-full rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProbabilityColor(probability)}`}
                  style={{ width: `${Math.min(probability, 100)}%` }}
                />
              </div>
              {deal.expected_close && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <IconCalendar className="h-3 w-3" strokeWidth={1.5} />
                  Previsão: {new Date(deal.expected_close).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Scrollable body ─────────────────────────── */}
        <ScrollArea className="flex-1">
          <div className="px-6 py-5 space-y-6">

            {/* ── Contact card ─────────────────────────── */}
            <section>
              <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                <IconUser className="h-3.5 w-3.5" strokeWidth={1.5} />
                Contato
              </h4>
              <div className="rounded-lg border bg-muted/20 divide-y">
                {deal.company && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <IconBuilding className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Empresa</p>
                      <p className="text-sm font-medium truncate">{deal.company}</p>
                    </div>
                  </div>
                )}
                {deal.contact && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <IconUser className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Nome</p>
                      <p className="text-sm font-medium truncate">{deal.contact}</p>
                    </div>
                  </div>
                )}
                {deal.contact_email && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <IconMail className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">E-mail</p>
                      <a
                        href={`mailto:${deal.contact_email}`}
                        className="text-sm font-medium text-primary hover:underline truncate block"
                      >
                        {deal.contact_email}
                      </a>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(deal.contact_email!); }}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <IconCopy className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Copiar e-mail</TooltipContent>
                    </Tooltip>
                  </div>
                )}
                {contactPhone && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <IconPhone className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Telefone</p>
                      <a
                        href={`tel:${contactPhone}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {contactPhone}
                      </a>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(contactPhone); }}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <IconCopy className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Copiar telefone</TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            </section>

            {/* ── Details grid ─────────────────────────── */}
            <section>
              <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                <IconBriefcase className="h-3.5 w-3.5" strokeWidth={1.5} />
                Detalhes
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {deal.owner_name && (
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <IconTarget className="h-3 w-3" strokeWidth={1.5} />
                      Responsável
                    </p>
                    <p className="mt-1 text-sm font-semibold">{deal.owner_name}</p>
                  </div>
                )}
                {deal.expected_close && value === 0 && (
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <IconCalendar className="h-3 w-3" strokeWidth={1.5} />
                      Previsão
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {new Date(deal.expected_close).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}
                {(rdPipelineName || rdStageName) && (
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <IconGitBranch className="h-3 w-3" strokeWidth={1.5} />
                      Funil
                    </p>
                    <p className="mt-1 text-sm font-semibold truncate">
                      {rdPipelineName ?? rdStageName}
                    </p>
                    {rdPipelineName && rdStageName && (
                      <p className="text-xs text-muted-foreground truncate">{rdStageName}</p>
                    )}
                  </div>
                )}
                {value === 0 && probability > 0 && (
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <IconPercentage className="h-3 w-3" strokeWidth={1.5} />
                      Probabilidade
                    </p>
                    <p className="mt-1 text-sm font-semibold">{probability}%</p>
                  </div>
                )}
              </div>
            </section>

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
              // Also check if deal mentions "lançamento" or "imobiliário" in name/notes
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

            {/* ── #3 Next action / follow-up ─────────── */}
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

            {/* ── #4 Loss reason ───────────────────────── */}
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

            {/* ── #10 Tags ─────────────────────────────── */}
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

            {/* ── #9 Stakeholders ──────────────────────── */}
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

            {/* ── #5 + #6 Linked project & contract ────── */}
            <DealLinkedEntities dealId={deal.id} company={deal.company} />

            {/* ── #7 Value history ─────────────────────── */}
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
                            {ev.value > valueHistory[i - 1].value ? "↑" : "↓"}
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
        </ScrollArea>

        {/* ── Footer ──────────────────────────────────── */}
        {onEdit && (
          <div className="border-t px-6 py-4">
            <Button
              className="w-full font-semibold"
              onClick={() => onEdit(deal)}
            >
              <IconEdit className="mr-2 h-4 w-4" strokeWidth={1.5} />
              Editar Deal
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ── #5 + #6 Linked Project & Contract ───────────────────────────────────────

function DealLinkedEntities({ dealId, company }: { dealId: string; company: string | null }) {
  const { data } = useQuery({
    queryKey: ["deal-linked", dealId],
    queryFn: async () => {
      const supabase = createClient();

      // Find project linked via deal automation
      const { data: projects } = await supabase
        .from("projects")
        .select("id, name, code, status")
        .eq("source", "deal_automation")
        .ilike("name", `%${company ?? "___NOMATCH___"}%`)
        .order("created_at", { ascending: false })
        .limit(1);

      // Find contract linked
      const { data: contracts } = await supabase
        .from("contracts")
        .select("id, title, status, project_name")
        .ilike("project_name", `%${company ?? "___NOMATCH___"}%`)
        .order("created_at", { ascending: false })
        .limit(1);

      return {
        project: (projects as unknown as Array<{ id: string; name: string; code: string | null; status: string }> | null)?.[0] ?? null,
        contract: (contracts as unknown as Array<{ id: string; title: string; status: string }> | null)?.[0] ?? null,
      };
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!company,
  });

  if (!data?.project && !data?.contract) return null;

  return (
    <section>
      <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
        <IconLink className="h-3.5 w-3.5" strokeWidth={1.5} />
        Vínculos
      </h4>
      <div className="space-y-2">
        {data.project && (
          <Link
            href={`/projetos?id=${data.project.id}`}
            className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3 transition-colors hover:bg-muted/40"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff4ec]">
              <IconFolder className="h-4 w-4 text-[#ff6200]" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Projeto</p>
              <p className="text-sm font-semibold truncate">{data.project.code ?? data.project.name}</p>
            </div>
            <Badge variant="secondary" className="text-[10px] shrink-0">{data.project.status}</Badge>
            <IconArrowRight className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
          </Link>
        )}
        {data.contract && (
          <Link
            href="/contratos"
            className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3 transition-colors hover:bg-muted/40"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <IconFileText className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Contrato</p>
              <p className="text-sm font-semibold truncate">{data.contract.title}</p>
            </div>
            <Badge variant="secondary" className="text-[10px] shrink-0">{data.contract.status}</Badge>
            <IconArrowRight className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
          </Link>
        )}
      </div>
    </section>
  );
}

// ── Activity Timeline ───────────────────────────────────────────────────────

function DealActivityTimeline({
  dealId,
  rdDealId,
}: {
  dealId: string;
  rdDealId: string | null;
}) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["deal-activities", dealId],
    queryFn: async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("crm_deal_activities" as never)
        .select("*")
        .eq("deal_id", dealId)
        .order("occurred_at", { ascending: false })
        .limit(50);

      // If no results by deal_id and we have rd_deal_id, try that
      if ((!data || (data as unknown[]).length === 0) && rdDealId) {
        const { data: rdData } = await supabase
          .from("crm_deal_activities" as never)
          .select("*")
          .eq("rd_deal_id", rdDealId)
          .order("occurred_at", { ascending: false })
          .limit(50);
        return (rdData ?? []) as unknown as DealActivity[];
      }

      if (error) return [];
      return (data ?? []) as unknown as DealActivity[];
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!dealId,
  });

  return (
    <div>
      <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
        <IconClock className="h-3.5 w-3.5" strokeWidth={1.5} />
        Histórico
        <span className="ml-auto text-[10px] font-medium tabular-nums">
          {activities.length} {activities.length === 1 ? "registro" : "registros"}
        </span>
      </h4>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
          <IconClock className="h-6 w-6 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="mt-2 text-sm text-muted-foreground">Nenhuma atividade registrada</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">Atividades aparecerão aqui conforme o deal avançar</p>
        </div>
      ) : (
        <div className="relative space-y-0">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

          {activities.map((activity, index) => {
            const Icon = ACTIVITY_ICONS[activity.type] ?? IconMessage;
            const label = ACTIVITY_LABELS[activity.type] ?? activity.type;
            const colorClass = ACTIVITY_COLORS[activity.type] ?? "bg-gray-100 text-gray-600";

            return (
              <div
                key={activity.id}
                className="relative flex gap-3 py-2 pl-0"
              >
                {/* Icon dot */}
                <div className={`relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{label}</span>
                    {activity.author_name && (
                      <span className="text-xs text-muted-foreground truncate">
                        por {activity.author_name}
                      </span>
                    )}
                    <span className="ml-auto text-[10px] tabular-nums text-muted-foreground/70 shrink-0">
                      {new Date(activity.occurred_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })}
                    </span>
                  </div>
                  {activity.title && (
                    <p className="text-sm text-foreground/80 truncate mt-0.5">
                      {activity.title}
                    </p>
                  )}
                  {activity.content && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                      {activity.content}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
