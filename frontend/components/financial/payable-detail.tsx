"use client";

import { useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PAYABLE_STATUS } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarDays,
  CheckCircle2,
  DollarSign,
  FileText,
  Trash2,
} from "lucide-react";
import { formatBRL } from "@/lib/format";
import { OmieSyncBadge } from "./omie-sync-badge";

type PayableRow = Database["public"]["Tables"]["fin_payables"]["Row"];

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
  const [confirmAction, setConfirmAction] = useState<"delete" | "pay" | null>(
    null
  );

  if (!payable) return null;

  const st = PAYABLE_STATUS[payable.status as keyof typeof PAYABLE_STATUS];
  const canPay = ["aberto", "aprovado", "parcial", "atrasado"].includes(
    payable.status ?? ""
  );

  function handleConfirm() {
    if (!payable) return;
    if (confirmAction === "delete") onDelete(payable.id);
    if (confirmAction === "pay") onMarkPaid(payable.id);
    setConfirmAction(null);
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>{payable.description}</SheetTitle>
            <SheetDescription className="sr-only">
              Detalhes da conta a pagar
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-4 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {st && (
                <Badge
                  variant="secondary"
                  style={{ backgroundColor: st.bg, color: st.color }}
                >
                  {st.label}
                </Badge>
              )}
              <OmieSyncBadge
                syncedAt={(payable as Record<string, unknown>).omie_synced_at as string | null}
                showWarning
              />
            </div>

            <Separator />

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">
                  {formatBRL(payable.amount)}
                </span>
                {(payable.amount_paid ?? 0) > 0 && (
                  <span className="text-muted-foreground">
                    (pago: {formatBRL(payable.amount_paid ?? 0)})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>
                  Vencimento:{" "}
                  {format(
                    new Date(payable.due_date + "T12:00:00"),
                    "dd MMM yyyy",
                    { locale: ptBR }
                  )}
                </span>
              </div>

              {payable.paid_date && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-green-500" />
                  <span>
                    Pago em:{" "}
                    {format(new Date(payable.paid_date), "dd MMM yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              )}

              {payable.payment_method && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span>Forma: {payable.payment_method}</span>
                </div>
              )}

              {payable.notes && (
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">
                    {payable.notes}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex gap-2">
              {canPay && (
                <Button size="sm" onClick={() => setConfirmAction("pay")}>
                  Marcar como Pago
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setConfirmAction("delete")}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Cancelar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(o) => !o && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "delete"
                ? "Cancelar conta a pagar?"
                : "Marcar como pago?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "delete"
                ? `Tem certeza que deseja cancelar "${payable.description}"? Essa acao nao pode ser desfeita.`
                : `Confirma a baixa de "${payable.description}" no valor de ${formatBRL(payable.amount)}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                confirmAction === "delete"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {confirmAction === "delete" ? "Sim, cancelar" : "Sim, dar baixa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
