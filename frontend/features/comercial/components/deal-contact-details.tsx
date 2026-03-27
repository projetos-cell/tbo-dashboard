"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  IconCalendar,
  IconBuilding,
  IconUser,
  IconMail,
  IconPhone,
  IconTarget,
  IconGitBranch,
  IconPercentage,
  IconCopy,
  IconBriefcase,
} from "@tabler/icons-react";
import type { Database } from "@/lib/supabase/types";
import { copyToClipboard } from "./deal-detail-helpers";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

interface DealContactDetailsProps {
  deal: DealRow;
}

export function DealContactDetails({ deal }: DealContactDetailsProps) {
  const dealAny = deal as Record<string, unknown>;
  const contactPhone = dealAny.contact_phone ? String(dealAny.contact_phone) : null;
  const rdPipelineName = dealAny.rd_pipeline_name ? String(dealAny.rd_pipeline_name) : null;
  const rdStageName = dealAny.rd_stage_name ? String(dealAny.rd_stage_name) : null;

  const probability = deal.probability ?? 0;
  const value = Number(deal.value) || 0;

  return (
    <>
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
    </>
  );
}
