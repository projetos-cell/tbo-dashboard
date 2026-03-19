"use client";

// ── ConciliacaoUpload ─────────────────────────────────────────────────────────
// Componente de importação de extrato OFX/CNAB com drag-drop, preview e confirm.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useRef, useState } from "react";
import { useBankStatementUpload } from "@/features/financeiro/hooks/use-bank-statement-upload";
import type { BankAccount } from "@/lib/supabase/types/bank-reconciliation";
import { fmt } from "@/features/financeiro/lib/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconUpload,
  IconFileTypography,
  IconCheck,
  IconAlertTriangle,
  IconX,
  IconBuildingBank,
  IconArrowRight,
  IconCalendar,
  IconCash,
  IconPlus,
  IconLoader2,
} from "@tabler/icons-react";

// ── Props ────────────────────────────────────────────────────────────────────

interface ConciliacaoUploadProps {
  bankAccounts: BankAccount[];
  onImportComplete?: () => void;
}

// ── Drop zone ────────────────────────────────────────────────────────────────

const ACCEPTED_EXTENSIONS = [".ofx", ".ret", ".rem"];

function DropZone({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFile(file);
      // Reset input so same file can be re-selected
      e.target.value = "";
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative cursor-pointer rounded-lg border-2 border-dashed
        transition-all duration-200 ease-out
        ${isDragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        }
      `}
    >
      <div className="flex flex-col items-center gap-3 py-8 px-4">
        <div
          className={`rounded-full p-3 transition-colors ${
            isDragging ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          <IconUpload className="size-6" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">
            Arraste um extrato bancário aqui
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ou clique para selecionar — OFX, RET, REM
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        onChange={handleChange}
        className="sr-only"
        aria-label="Selecionar arquivo de extrato bancário"
      />
    </div>
  );
}

// ── Preview card ────────────────────────────────────────────────────────────

interface PreviewInfoProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function PreviewInfo({ icon, label, value }: PreviewInfoProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export function ConciliacaoUpload({
  bankAccounts,
  onImportComplete,
}: ConciliacaoUploadProps) {
  const [open, setOpen] = useState(false);
  const {
    state,
    parseFile,
    selectBankAccount,
    confirmImport,
    createAccountAndImport,
    reset,
    isImporting,
  } = useBankStatementUpload();

  const handleFile = useCallback(
    (file: File) => {
      setOpen(true);
      void parseFile(file);
    },
    [parseFile]
  );

  const handleClose = useCallback(() => {
    if (state.step === "done") {
      onImportComplete?.();
    }
    setOpen(false);
    // Delay reset to allow dialog exit animation
    setTimeout(reset, 200);
  }, [state.step, onImportComplete, reset]);

  const { parsed, bankAccountId } = state;
  const formatLabel = parsed?.format === "ofx" ? "OFX" : "CNAB 240";

  return (
    <>
      <DropZone onFile={handleFile} />

      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="sm:max-w-lg">
          {/* ── Parsing ── */}
          {state.step === "parsing" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <IconLoader2 className="size-4 animate-spin" />
                  Processando arquivo...
                </DialogTitle>
                <DialogDescription>
                  Lendo e validando o extrato bancário.
                </DialogDescription>
              </DialogHeader>
              <Progress value={50} className="mt-4" />
            </>
          )}

          {/* ── Error ── */}
          {state.step === "error" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <IconAlertTriangle className="size-4" />
                  Erro na importação
                </DialogTitle>
                <DialogDescription>{state.error}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}

          {/* ── Preview ── */}
          {state.step === "preview" && parsed && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <IconFileTypography className="size-4" />
                  Confirmar importação
                </DialogTitle>
                <DialogDescription>
                  Revise os dados extraídos do arquivo antes de importar.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* File info card */}
                <Card>
                  <CardContent className="pt-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {state.file?.name}
                      </span>
                      <Badge variant="secondary">{formatLabel}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <PreviewInfo
                        icon={<IconBuildingBank className="size-3.5" />}
                        label="Banco"
                        value={parsed.bankCode ? `${parsed.bankCode}${parsed.agency ? ` / Ag. ${parsed.agency}` : ""}` : "—"}
                      />
                      <PreviewInfo
                        icon={<IconCalendar className="size-3.5" />}
                        label="Período"
                        value={`${parsed.startDate} a ${parsed.endDate}`}
                      />
                      <PreviewInfo
                        icon={<IconCash className="size-3.5" />}
                        label="Créditos"
                        value={`${fmt(parsed.totalCredits)} (${parsed.transactionCount > 0 ? parsed.transactions.length || "—" : 0})`}
                      />
                      <PreviewInfo
                        icon={<IconCash className="size-3.5" />}
                        label="Débitos"
                        value={fmt(parsed.totalDebits)}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t">
                      <IconArrowRight className="size-3.5 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>{parsed.transactionCount}</strong> transações serão importadas
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Bank account selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vincular à conta bancária</label>
                  <Select
                    value={bankAccountId ?? ""}
                    onValueChange={selectBankAccount}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma conta..." />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.bank_name} — {acc.agency}/{acc.account_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                {/* Create new account option */}
                {!bankAccountId && parsed.accountId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void createAccountAndImport()}
                    disabled={isImporting}
                    className="mr-auto"
                  >
                    <IconPlus className="size-3.5 mr-1.5" />
                    Criar conta e importar
                  </Button>
                )}
                <Button variant="ghost" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={confirmImport}
                  disabled={!bankAccountId || isImporting}
                >
                  {isImporting ? (
                    <>
                      <IconLoader2 className="size-3.5 mr-1.5 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <IconUpload className="size-3.5 mr-1.5" />
                      Importar {parsed.transactionCount} transações
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}

          {/* ── Importing ── */}
          {state.step === "importing" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <IconLoader2 className="size-4 animate-spin" />
                  Importando transações...
                </DialogTitle>
                <DialogDescription>
                  Salvando {parsed?.transactionCount ?? 0} transações no banco de dados.
                </DialogDescription>
              </DialogHeader>
              <Progress value={75} className="mt-4" />
            </>
          )}

          {/* ── Done ── */}
          {state.step === "done" && state.result && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-emerald-600">
                  <IconCheck className="size-4" />
                  Importação concluída
                </DialogTitle>
                <DialogDescription>
                  O extrato foi importado com sucesso. A conciliação automática será executada.
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center gap-6 py-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{state.result.inserted}</p>
                  <p className="text-xs text-muted-foreground">Importadas</p>
                </div>
                {state.result.skipped > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-500">{state.result.skipped}</p>
                    <p className="text-xs text-muted-foreground">Duplicadas (ignoradas)</p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button onClick={handleClose}>
                  <IconX className="size-3.5 mr-1.5" />
                  Fechar e conciliar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
