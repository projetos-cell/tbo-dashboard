"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  IconCurrencyDollar,
  IconCalendar,
  IconBuilding,
  IconUser,
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
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import { DEAL_STAGES, type DealStageKey } from "@/lib/constants";

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-left">{deal.name}</SheetTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              style={{
                backgroundColor: stageConfig.bg,
                color: stageConfig.color,
              }}
            >
              {stageConfig.label}
            </Badge>
            {deal.priority && (
              <Badge variant="outline" className="capitalize">
                {deal.priority}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Contact & Company */}
          <div className="space-y-2 text-sm">
            {deal.company && (
              <div className="flex items-center gap-2">
                <IconBuilding className="h-4 w-4 text-gray-500" />
                <span>{deal.company}</span>
              </div>
            )}
            {deal.contact && (
              <div className="flex items-center gap-2">
                <IconUser className="h-4 w-4 text-gray-500" />
                <span>{deal.contact}</span>
              </div>
            )}
            {deal.contact_email && (
              <div className="flex items-center gap-2">
                <IconMail className="h-4 w-4 text-gray-500" />
                <a href={`mailto:${deal.contact_email}`} className="text-blue-600 hover:underline">
                  {deal.contact_email}
                </a>
              </div>
            )}
            {contactPhone && (
              <div className="flex items-center gap-2">
                <IconPhone className="h-4 w-4 text-gray-500" />
                <a href={`tel:${contactPhone}`} className="text-blue-600 hover:underline">
                  {contactPhone}
                </a>
              </div>
            )}
          </div>

          {/* Value & Dates */}
          <Separator />
          <div className="space-y-2 text-sm">
            {deal.value != null && (
              <div className="flex items-center gap-2">
                <IconCurrencyDollar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">
                  {formatCurrency(deal.value)}
                </span>
                {deal.probability != null && (
                  <span className="text-gray-500">
                    ({deal.probability}% probabilidade)
                  </span>
                )}
              </div>
            )}
            {deal.expected_close && (
              <div className="flex items-center gap-2">
                <IconCalendar className="h-4 w-4 text-gray-500" />
                <span>
                  Previsão:{" "}
                  {new Date(deal.expected_close).toLocaleDateString("pt-BR")}
                </span>
              </div>
            )}
            {deal.owner_name && (
              <div className="flex items-center gap-2">
                <IconTarget className="h-4 w-4 text-gray-500" />
                <span>Responsável: {deal.owner_name}</span>
              </div>
            )}
          </div>

          {/* Pipeline info */}
          {(rdPipelineName || rdStageName) && (
            <>
              <Separator />
              <div className="space-y-2 text-sm">
                <h4 className="font-medium flex items-center gap-2">
                  <IconGitBranch className="h-4 w-4" />
                  Funil
                </h4>
                {rdPipelineName && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Funil</span>
                    <span>{rdPipelineName}</span>
                  </div>
                )}
                {rdStageName && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Etapa</span>
                    <Badge variant="secondary" className="text-xs">
                      {rdStageName}
                    </Badge>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Services */}
          {deal.services && deal.services.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Serviços</h4>
                <div className="flex flex-wrap gap-1">
                  {deal.services.map((s) => (
                    <Badge key={s} variant="outline" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {deal.notes && (
            <>
              <Separator />
              <div className="space-y-1 text-sm">
                <h4 className="font-medium">Observações</h4>
                <p className="whitespace-pre-wrap text-gray-500">
                  {deal.notes}
                </p>
              </div>
            </>
          )}

          {/* Activity Timeline */}
          <Separator />
          <DealActivityTimeline dealId={deal.id} rdDealId={deal.rd_deal_id} />

          {/* Actions */}
          {onEdit && (
            <>
              <Separator />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onEdit(deal)}
              >
                Editar Deal
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
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
    <div className="space-y-2">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <IconClock className="h-4 w-4" />
        Histórico ({activities.length})
      </h4>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className="text-xs text-gray-500 py-2">
          Nenhuma atividade registrada.
        </p>
      ) : (
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {activities.map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.type] ?? IconMessage;
            const label = ACTIVITY_LABELS[activity.type] ?? activity.type;

            return (
              <div
                key={activity.id}
                className="flex gap-2 rounded-md p-2 text-xs hover:bg-gray-50 transition-colors"
              >
                <Icon className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                      {label}
                    </Badge>
                    {activity.author_name && (
                      <span className="text-gray-500 truncate">
                        {activity.author_name}
                      </span>
                    )}
                    <span className="text-gray-400 ml-auto shrink-0">
                      {new Date(activity.occurred_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })}
                    </span>
                  </div>
                  {activity.title && (
                    <p className="font-medium text-gray-700 truncate mt-0.5">
                      {activity.title}
                    </p>
                  )}
                  {activity.content && (
                    <p className="text-gray-500 line-clamp-2 mt-0.5">
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
