"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

// ── Types ────────────────────────────────────────────────────

interface ParsedTransaction {
  date: string;
  amount: number;
  description: string;
  fitid?: string;
  memo?: string;
}

type Step = "upload" | "preview" | "confirm" | "done";

interface FinImportDialogProps {
  open: boolean;
  onClose: () => void;
}

// ── OFX Parser ───────────────────────────────────────────────

function parseOFX(text: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match: RegExpExecArray | null;

  while ((match = stmtTrnRegex.exec(text)) !== null) {
    const block = match[1]!;

    const dtposted = block.match(/<DTPOSTED>([\d]+)/)?.[1] ?? "";
    const trnamt = block.match(/<TRNAMT>([-\d.,]+)/)?.[1] ?? "0";
    const fitid = block.match(/<FITID>([^\s<]+)/)?.[1] ?? "";
    const memo = block.match(/<MEMO>([^\n<]+)/)?.[1]?.trim() ?? "";
    const name = block.match(/<NAME>([^\n<]+)/)?.[1]?.trim() ?? "";

    // Parse date YYYYMMDD
    const year = dtposted.slice(0, 4);
    const month = dtposted.slice(4, 6);
    const day = dtposted.slice(6, 8);
    const dateStr = year && month && day ? `${year}-${month}-${day}` : "";

    // Parse amount (handle both . and , as decimal separators)
    const amountStr = trnamt.replace(",", ".");
    const amount = parseFloat(amountStr) || 0;

    if (dateStr) {
      transactions.push({
        date: dateStr,
        amount,
        description: name || memo,
        fitid,
        memo,
      });
    }
  }

  return transactions;
}

// ── CSV Parser ───────────────────────────────────────────────

function detectDelimiter(firstLine: string): string {
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  return semicolonCount > commaCount ? ";" : ",";
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };

  const delimiter = detectDelimiter(lines[0]!);
  const headers = lines[0]!.split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) =>
    line.split(delimiter).map((cell) => cell.trim().replace(/^"|"$/g, ""))
  );

  return { headers, rows };
}

function parseAmount(value: string): number {
  // Tenta R$ 1.234,56 ou 1234.56
  let cleaned = value.replace(/[R$\s]/g, "");
  // Se tem virgula como decimal (formato BR)
  if (cleaned.includes(",") && cleaned.includes(".")) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (cleaned.includes(",")) {
    cleaned = cleaned.replace(",", ".");
  }
  return parseFloat(cleaned) || 0;
}

function parseDate(value: string): string {
  // dd/MM/yyyy -> yyyy-MM-dd
  const brMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;

  // yyyy-MM-dd already ok
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  // MM/dd/yyyy
  const usMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (usMatch) return `${usMatch[3]}-${usMatch[1]}-${usMatch[2]}`;

  return value;
}

// ── Component ────────────────────────────────────────────────

export function FinImportDialog({ open, onClose }: FinImportDialogProps) {
  const [step, setStep] = useState<Step>("upload");
  const [fileFormat, setFileFormat] = useState<"ofx" | "csv" | null>(null);
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [columnMap, setColumnMap] = useState<{ date: string; amount: string; description: string }>({
    date: "",
    amount: "",
    description: "",
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ count: number } | null>(null);

  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const { toast } = useToast();

  // Reset state when dialog closes
  const handleClose = useCallback(() => {
    setStep("upload");
    setFileFormat(null);
    setTransactions([]);
    setCsvHeaders([]);
    setCsvRows([]);
    setColumnMap({ date: "", amount: "", description: "" });
    setIsDragging(false);
    setIsImporting(false);
    setImportResult(null);
    onClose();
  }, [onClose]);

  // ── File handling ──

  const processFile = useCallback(
    (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target?.result as string;

        if (ext === "ofx") {
          setFileFormat("ofx");
          const parsed = parseOFX(text);
          setTransactions(parsed);
          setStep("preview");
        } else if (ext === "csv") {
          setFileFormat("csv");
          const { headers, rows } = parseCSV(text);
          setCsvHeaders(headers);
          setCsvRows(rows);

          // Tentativa de mapeamento automatico
          const autoDate = headers.find((h) =>
            /data|date|dt|vencimento/i.test(h)
          );
          const autoAmount = headers.find((h) =>
            /valor|amount|vlr|montante/i.test(h)
          );
          const autoDesc = headers.find((h) =>
            /descri|description|historico|memo|obs/i.test(h)
          );

          setColumnMap({
            date: autoDate ?? "",
            amount: autoAmount ?? "",
            description: autoDesc ?? "",
          });
          setStep("preview");
        } else {
          toast({
            title: "Formato nao suportado",
            description: "Use arquivos .ofx ou .csv",
            variant: "destructive",
          });
        }
      };

      reader.readAsText(file, "utf-8");
    },
    [toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  // ── CSV mapping -> transactions ──

  const mappedCsvTransactions = useMemo<ParsedTransaction[]>(() => {
    if (fileFormat !== "csv" || !columnMap.date || !columnMap.amount) return [];

    const dateIdx = csvHeaders.indexOf(columnMap.date);
    const amountIdx = csvHeaders.indexOf(columnMap.amount);
    const descIdx = columnMap.description ? csvHeaders.indexOf(columnMap.description) : -1;

    return csvRows
      .map((row) => ({
        date: parseDate(row[dateIdx] ?? ""),
        amount: parseAmount(row[amountIdx] ?? "0"),
        description: descIdx >= 0 ? (row[descIdx] ?? "") : "",
      }))
      .filter((t) => t.date && t.amount !== 0);
  }, [fileFormat, csvHeaders, csvRows, columnMap]);

  const previewTransactions = fileFormat === "csv" ? mappedCsvTransactions : transactions;

  // ── Summary ──

  const summary = useMemo(() => {
    const txns = previewTransactions;
    if (!txns.length) return null;
    const debits = txns.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);
    const credits = txns.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const dates = txns.map((t) => t.date).sort();
    return {
      count: txns.length,
      dateRange: `${formatDateBR(dates[0]!)} a ${formatDateBR(dates[dates.length - 1]!)}`,
      debits,
      credits,
    };
  }, [previewTransactions]);

  // ── Import ──

  const handleImport = useCallback(async () => {
    if (!tenantId || !userId) return;

    setIsImporting(true);
    try {
      const supabase = createClient();

      // 1) Criar registro de importacao
      const filename = fileFormat === "ofx" ? "import.ofx" : "import.csv";
      const { data: importRow, error: importErr } = await supabase
        .from("bank_imports")
        .insert({
          tenant_id: tenantId,
          filename,
          format: fileFormat ?? "csv",
          transaction_count: previewTransactions.length,
          imported_by: userId,
          status: "processed",
        } as never)
        .select()
        .single();

      if (importErr) throw importErr;
      const importId = (importRow as unknown as { id: string }).id;

      // 2) Inserir transacoes
      const rows = previewTransactions.map((t) => ({
        tenant_id: tenantId,
        import_id: importId,
        date: t.date,
        amount: t.amount,
        description: t.description,
        fitid: t.fitid ?? null,
        memo: t.memo ?? null,
        match_status: "pending",
      }));

      const { error: txnErr } = await supabase
        .from("bank_transactions")
        .insert(rows as never);

      if (txnErr) throw txnErr;

      setImportResult({ count: previewTransactions.length });
      setStep("done");
      toast({
        title: "Importacao concluida",
        description: `${previewTransactions.length} transacoes importadas com sucesso.`,
      });
    } catch (err) {
      toast({
        title: "Erro na importacao",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  }, [tenantId, userId, fileFormat, previewTransactions, toast]);

  // ── Render ─────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "upload" && "Importar Extrato Bancario"}
            {step === "preview" && "Visualizar & Mapear Colunas"}
            {step === "confirm" && "Confirmar Importacao"}
            {step === "done" && "Importacao Concluida"}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" && "Arraste um arquivo OFX ou CSV, ou clique para selecionar."}
            {step === "preview" && "Confira as transacoes antes de importar."}
            {step === "confirm" && "Revise o resumo e confirme."}
            {step === "done" && "Transacoes importadas com sucesso."}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div
            className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Arraste o arquivo aqui ou{" "}
              <label className="cursor-pointer text-primary underline">
                selecione
                <input
                  type="file"
                  className="hidden"
                  accept=".ofx,.csv"
                  onChange={handleFileInput}
                />
              </label>
            </p>
            <p className="text-xs text-muted-foreground">
              Formatos aceitos: .ofx, .csv
            </p>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === "preview" && (
          <div className="space-y-4">
            {/* CSV column mapping */}
            {fileFormat === "csv" && csvHeaders.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Coluna Data *
                  </label>
                  <Select
                    value={columnMap.date}
                    onValueChange={(v) => setColumnMap((m) => ({ ...m, date: v }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {csvHeaders.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Coluna Valor *
                  </label>
                  <Select
                    value={columnMap.amount}
                    onValueChange={(v) => setColumnMap((m) => ({ ...m, amount: v }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {csvHeaders.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Coluna Descricao
                  </label>
                  <Select
                    value={columnMap.description}
                    onValueChange={(v) => setColumnMap((m) => ({ ...m, description: v }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {csvHeaders.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Transaction preview table */}
            {previewTransactions.length > 0 ? (
              <>
                <p className="text-xs text-muted-foreground">
                  Mostrando {Math.min(10, previewTransactions.length)} de{" "}
                  {previewTransactions.length} transacoes
                </p>
                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Data</TableHead>
                        <TableHead className="text-xs text-right">Valor</TableHead>
                        <TableHead className="text-xs">Descricao</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewTransactions.slice(0, 10).map((t, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {formatDateBR(t.date)}
                          </TableCell>
                          <TableCell
                            className={`text-xs text-right font-mono ${
                              t.amount >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {fmtCurrency(t.amount)}
                          </TableCell>
                          <TableCell className="text-xs max-w-[200px] truncate">
                            {t.description}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {fileFormat === "csv"
                  ? "Mapeie as colunas acima para visualizar as transacoes."
                  : "Nenhuma transacao encontrada no arquivo."}
              </p>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Voltar
              </Button>
              <Button
                disabled={previewTransactions.length === 0}
                onClick={() => setStep("confirm")}
              >
                Continuar
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === "confirm" && summary && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-semibold">
                  Resumo da importacao
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-muted-foreground">Transacoes:</span>
                <span className="font-medium">{summary.count}</span>
                <span className="text-muted-foreground">Periodo:</span>
                <span className="font-medium">{summary.dateRange}</span>
                <span className="text-muted-foreground">Total creditos:</span>
                <span className="font-medium text-green-600">
                  {fmtCurrency(summary.credits)}
                </span>
                <span className="text-muted-foreground">Total debitos:</span>
                <span className="font-medium text-red-600">
                  {fmtCurrency(summary.debits)}
                </span>
              </div>
              <Badge variant="secondary" className="mt-2 text-xs">
                Formato: {fileFormat?.toUpperCase()}
              </Badge>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep("preview")}>
                Voltar
              </Button>
              <Button disabled={isImporting} onClick={handleImport}>
                {isImporting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Importar
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 4: Done */}
        {step === "done" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-sm font-semibold">
              {importResult?.count} transacoes importadas com sucesso!
            </p>
            <p className="text-xs text-muted-foreground">
              Voce pode conferir na aba de conciliacao bancaria.
            </p>
            <Button onClick={handleClose} className="mt-2">
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Formatting helpers ───────────────────────────────────────

function formatDateBR(dateStr: string): string {
  if (!dateStr) return "---";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function fmtCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
