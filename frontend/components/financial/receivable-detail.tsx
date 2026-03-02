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
import { RECEIVABLE_STATUS } from "@/lib/constants";
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

type ReceivableRow = Database["public"]["Tables"]["fin_receivables"]["Row"];

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
  const [confirmAction, setConfirmAction] = useState<
    "delete" | "receive" | null
  >(null);

  if (!receivable) return null;

  const st =
    RECEIVABLE_STATUS[receivable.status as keyof typeof RECEIVABLE_STATUS];
  const canPay = ["aberto", "emitido", "parcial", "atrasado"].includes(
    receivable.status ?? ""
  );

  function handleConfirm() {
    if (!receivable) return;
    if (confirmAction === "delete") onDelete(receivable.id);
    if (confirmAction === "receive") onMarkPaid(receivable.id);
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
                syncedAt={(receivable as Record<string, unknown>).omie_synced_at as string | null}
                showWarning
              />
            </div>

            <Separator />

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">
                  {formatBRL(receivable.amount)}
                </span>
                {(receivable.amount_paid ?? 0) > 0 && (
                  <span className="text-muted-foreground">
                    (recebido: {formatBRL(receivable.amount_paid ?? 0)})
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
                    {format(new Date(receivable.paid_date), "dd MMM yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              )}

              {receivable.payment_method && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span>Forma: {receivable.payment_method}</span>
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
                <Button
                  size="sm"
                  onClick={() => setConfirmAction("receive")}
                >
                  Marcar como Recebido
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
                ? "Cancelar conta a receber?"
                : "Marcar como recebido?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "delete"
                ? `Tem certeza que deseja cancelar "${receivable.description}"? Essa acao nao pode ser desfeita.`
                : `Confirma o recebimento de "${receivable.description}" no valor de ${formatBRL(receivable.amount)}?`}
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
              {confirmAction === "delete"
                ? "Sim, cancelar"
                : "Sim, dar baixa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
