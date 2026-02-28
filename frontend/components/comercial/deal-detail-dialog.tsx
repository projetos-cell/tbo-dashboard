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
  DollarSign,
  Calendar,
  Building2,
  User,
  Mail,
  Phone,
  Target,
  Tag,
} from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import { DEAL_STAGES, type DealStageKey } from "@/lib/constants";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

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

export function DealDetailDialog({
  deal,
  open,
  onOpenChange,
  onEdit,
}: DealDetailDialogProps) {
  if (!deal) return null;

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
            {deal.source && (
              <Badge variant="outline" className="capitalize">
                {deal.source}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Contact & Company */}
          <div className="space-y-2 text-sm">
            {deal.company && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{deal.company}</span>
              </div>
            )}
            {deal.contact && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{deal.contact}</span>
              </div>
            )}
            {deal.contact_email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{deal.contact_email}</span>
              </div>
            )}
            {deal.contact_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{deal.contact_phone}</span>
              </div>
            )}
          </div>

          {/* Value & Dates */}
          <Separator />
          <div className="space-y-2 text-sm">
            {deal.value != null && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {formatCurrency(deal.value)}
                </span>
                {deal.probability != null && (
                  <span className="text-muted-foreground">
                    ({deal.probability}% probabilidade)
                  </span>
                )}
              </div>
            )}
            {deal.expected_close_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Previsão:{" "}
                  {new Date(deal.expected_close_date).toLocaleDateString(
                    "pt-BR",
                  )}
                </span>
              </div>
            )}
            {deal.owner_name && (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span>Responsável: {deal.owner_name}</span>
              </div>
            )}
          </div>

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

          {/* Description */}
          {deal.description && (
            <>
              <Separator />
              <div className="space-y-1 text-sm">
                <h4 className="font-medium">Descrição</h4>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {deal.description}
                </p>
              </div>
            </>
          )}

          {/* Lost reason */}
          {deal.stage === "fechado_perdido" && deal.lost_reason && (
            <>
              <Separator />
              <div className="space-y-1 text-sm">
                <h4 className="font-medium text-red-600">Motivo da Perda</h4>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {deal.lost_reason}
                </p>
              </div>
            </>
          )}

          {/* Notes */}
          {deal.notes && (
            <>
              <Separator />
              <div className="space-y-1 text-sm">
                <h4 className="font-medium">Observações</h4>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {deal.notes}
                </p>
              </div>
            </>
          )}

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
