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
import { PAYABLE_STATUS } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, DollarSign, FileText, Trash2 } from "lucide-react";

type PayableRow = Database["public"]["Tables"]["fin_payables"]["Row"];

function fmt(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface PayableDetailProps {
  payable: PayableRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  onMarkPaid: (id: string) => void;
}

export function PayableDetail({
  payable,
  open,
  onOpenChange,
  onDelete,
  onMarkPaid,
}: PayableDetailProps) {
  if (!payable) return null;

  const st = PAYABLE_STATUS[payable.status as keyof typeof PAYABLE_STATUS];
  const canPay = ["aberto", "aprovado", "parcial", "atrasado"].includes(
    payable.status
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{payable.description}</SheetTitle>
          <SheetDescription className="sr-only">
            Detalhes da conta a pagar
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
              <span className="font-semibold">{fmt(payable.amount)}</span>
              {payable.amount_paid > 0 && (
                <span className="text-muted-foreground">
                  (pago: {fmt(payable.amount_paid)})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>
                Vencimento:{" "}
                {format(new Date(payable.due_date + "T12:00:00"), "dd MMM yyyy", {
                  locale: ptBR,
                })}
              </span>
            </div>

            {payable.paid_date && (
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-green-500" />
                <span>
                  Pago em:{" "}
                  {format(
                    new Date(payable.paid_date),
                    "dd MMM yyyy",
                    { locale: ptBR }
                  )}
                </span>
              </div>
            )}

            {payable.notes && (
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">{payable.notes}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex gap-2">
            {canPay && (
              <Button
                size="sm"
                onClick={() => onMarkPaid(payable.id)}
              >
                Marcar como Pago
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(payable.id)}
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
