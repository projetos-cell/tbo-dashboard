"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconEdit,
  IconCalendar,
  IconCurrencyDollar,
  IconTag,
  IconBrandInstagram,
  IconUser,
} from "@tabler/icons-react";
import { MARKETING_CAMPAIGN_STATUS } from "@/lib/constants";
import type { MarketingCampaign, MarketingCampaignStatus } from "../../types/marketing";
import { CampaignFormModal } from "./campaign-form-modal";

interface Props {
  campaign: MarketingCampaign | null;
  open: boolean;
  onClose: () => void;
}

function BudgetBar({ budget, spent }: { budget: number | null; spent: number | null }) {
  if (!budget || budget === 0) return null;
  const pct = Math.min(((spent ?? 0) / budget) * 100, 100);
  const isOver = (spent ?? 0) > budget;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Budget utilizado</span>
        <span className={isOver ? "text-destructive font-medium" : ""}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isOver ? "bg-destructive" : pct > 80 ? "bg-amber-500" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Gasto: R$ {((spent ?? 0) / 100).toLocaleString("pt-BR")}</span>
        <span>Total: R$ {(budget / 100).toLocaleString("pt-BR")}</span>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0">
      <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

export function CampaignDetailDrawer({ campaign, open, onClose }: Props) {
  const [editOpen, setEditOpen] = useState(false);

  if (!campaign) return null;

  const statusDef = MARKETING_CAMPAIGN_STATUS[campaign.status as MarketingCampaignStatus];
  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("pt-BR") : "—";

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="pb-4">
            <div className="flex items-start justify-between gap-2 pr-8">
              <SheetTitle className="text-lg leading-tight">{campaign.name}</SheetTitle>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() => setEditOpen(true)}
              >
                <IconEdit size={14} className="mr-1" />
                Editar
              </Button>
            </div>
            {statusDef && (
              <Badge
                variant="secondary"
                style={{ backgroundColor: statusDef.bg, color: statusDef.color }}
                className="w-fit"
              >
                {statusDef.label}
              </Badge>
            )}
          </SheetHeader>

          <div className="space-y-6">
            {/* Descrição */}
            {campaign.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {campaign.description}
              </p>
            )}

            {/* Budget */}
            {campaign.budget != null && (
              <BudgetBar budget={campaign.budget} spent={campaign.spent} />
            )}

            {/* Info rows */}
            <div>
              <InfoRow
                icon={<IconCalendar size={16} />}
                label="Período"
                value={
                  campaign.start_date || campaign.end_date
                    ? `${formatDate(campaign.start_date)} → ${formatDate(campaign.end_date)}`
                    : "Não definido"
                }
              />
              {campaign.budget != null && (
                <InfoRow
                  icon={<IconCurrencyDollar size={16} />}
                  label="Budget"
                  value={`R$ ${(campaign.budget / 100).toLocaleString("pt-BR")}`}
                />
              )}
              {campaign.owner_name && (
                <InfoRow
                  icon={<IconUser size={16} />}
                  label="Responsável"
                  value={campaign.owner_name}
                />
              )}
              {campaign.channels.length > 0 && (
                <InfoRow
                  icon={<IconBrandInstagram size={16} />}
                  label="Canais"
                  value={
                    <div className="flex flex-wrap gap-1 mt-1">
                      {campaign.channels.map((ch) => (
                        <Badge key={ch} variant="outline" className="text-xs">
                          {ch}
                        </Badge>
                      ))}
                    </div>
                  }
                />
              )}
              {campaign.tags.length > 0 && (
                <InfoRow
                  icon={<IconTag size={16} />}
                  label="Tags"
                  value={
                    <div className="flex flex-wrap gap-1 mt-1">
                      {campaign.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  }
                />
              )}
              <InfoRow
                icon={<IconCalendar size={16} />}
                label="Criada em"
                value={formatDate(campaign.created_at)}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit modal */}
      <CampaignFormModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          onClose();
        }}
        campaign={campaign}
      />
    </>
  );
}

export function CampaignDetailDrawerSkeleton({ open, onClose }: Pick<Props, "open" | "onClose">) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md">
        <div className="space-y-4 pt-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
