"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { RECEIVABLE_STATUS } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, DollarSign, FileText, Trash2 } from "lucide-react";

type ReceivableRow = Database["public"]["Tables"]["fin_receivables"]["Row"];

function fmt(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface ReceivableDetailProps {
  receivable: ReceivableRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  onMarkPaid: (id: string) => void;
}

export function ReceivableDetail({
  receivable,
  open,
  onOpenChange,
  onDelete,
  onMarkPaid,
}: ReceivableDetailProps) {
  if (!receivable) return null;

  const st =
    RECEIVABLE_STATUS[receivable.status as keyof typeof RECEIVABLE_STATUS];
  const canPay = ["aberto", "emitido", "parcial", "atrasado"].includes(
    receivable.status ?? ""
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {receivable.description}
            {receivable.installment_number && receivable.installment_total
              ? ` (${receivable.installment_number}/${receivable.installment_total})`
              : ""}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Detalhes da conta a receber
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-4">
          {st && (
            <Badge
              variant="secondary"
              style={{ backgroundColor: st.bg, color: st.color }}
            >
              {st.label}
            </Badge>
          )}

          <Separator />

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{fmt(receivable.amount)}</span>
              {(receivable.amount_paid ?? 0) > 0 && (
                <span className="text-muted-foreground">
                  (recebido: {fmt(receivable.amount_paid ?? 0)})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>
                Vencimento:{" "}
                {format(
                  new Date(receivable.due_date + "T12:00:00"),
                  "dd MMM yyyy",
                  { locale: ptBR }
                )}
              </span>
            </div>

            {receivable.paid_date && (
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-green-500" />
                <span>
                  Recebido em:{" "}
                  {format(
                    new Date(receivable.paid_date),
                    "dd MMM yyyy",
                    { locale: ptBR }
                  )}
                </span>
              </div>
            )}

            {receivable.notes && (
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">
                  {receivable.notes}
                </span>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex gap-2">
            {canPay && (
              <Button size="sm" onClick={() => onMarkPaid(receivable.id)}>
                Marcar como Recebido
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(receivable.id)}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Cancelar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
