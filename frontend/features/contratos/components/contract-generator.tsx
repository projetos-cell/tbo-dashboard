"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  IconFileTypePdf,
  IconTemplate,
  IconBuilding,
  IconUser,
  IconCoin,
  IconClipboardText,
  IconLoader2,
  IconSparkles,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CONTRACT_TEMPLATES } from "../templates/types";
import type {
  ContractPdfData,
  ContractPdfScopeItem,
  ContractPdfSigner,
  ContractTemplateKey,
} from "../templates/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ContractGeneratorProps {
  /** Pre-fill data from existing contract */
  prefill?: Partial<ContractPdfData>;
  /** Callback with the generated File object */
  onGenerated?: (file: File) => void;
  /** Button variant */
  variant?: "default" | "outline" | "ghost" | "secondary";
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";
  /** Custom trigger label */
  label?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ContractGenerator({
  prefill,
  onGenerated,
  variant = "outline",
  size = "sm",
  label = "Gerar Contrato",
}: ContractGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<ContractTemplateKey>(
    mapTypeToTemplate(prefill?.type ?? "generico")
  );

  // Editable fields (complement to prefill)
  const [companyName, setCompanyName] = useState(
    prefill?.companyName ?? "TBO Agencia de Comunicacao Ltda."
  );
  const [companyCnpj, setCompanyCnpj] = useState(prefill?.companyCnpj ?? "");
  const [companyAddress, setCompanyAddress] = useState(prefill?.companyAddress ?? "");
  const [contracteeName, setContracteeName] = useState(prefill?.contracteeName ?? "");
  const [contracteeCnpj, setContracteeCnpj] = useState(prefill?.contracteeCnpj ?? "");
  const [contracteeCpf, setContracteeCpf] = useState(prefill?.contracteeCpf ?? "");
  const [contracteeAddress, setContracteeAddress] = useState(prefill?.contracteeAddress ?? "");
  const [paymentConditions, setPaymentConditions] = useState(prefill?.paymentConditions ?? "");
  const [penaltyPercent, setPenaltyPercent] = useState(prefill?.penaltyPercent ?? 10);
  const [customClause, setCustomClause] = useState("");

  const handleGenerate = useCallback(async () => {
    setLoading(true);

    try {
      const pdfData: ContractPdfData = {
        contractNumber: prefill?.contractNumber ?? null,
        title: prefill?.title ?? "Contrato",
        description: prefill?.description ?? null,
        category: prefill?.category ?? "cliente",
        type: prefill?.type ?? "pj",
        totalValue: prefill?.totalValue ?? 0,
        startDate: prefill?.startDate ?? null,
        endDate: prefill?.endDate ?? null,
        scopeItems: (prefill?.scopeItems ?? []) as ContractPdfScopeItem[],
        signers: (prefill?.signers ?? []) as ContractPdfSigner[],
        companyName,
        companyCnpj: companyCnpj || undefined,
        companyAddress: companyAddress || undefined,
        contracteeName: contracteeName || undefined,
        contracteeCnpj: contracteeCnpj || undefined,
        contracteeCpf: contracteeCpf || undefined,
        contracteeAddress: contracteeAddress || undefined,
        paymentConditions: paymentConditions || undefined,
        penaltyPercent,
        customClauses: customClause ? [customClause] : undefined,
      };

      const response = await fetch("/api/contracts/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template, data: pdfData }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error ?? "Erro ao gerar PDF");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const filenameMatch = disposition.match(/filename="(.+?)"/);
      const filename = filenameMatch?.[1] ?? "contrato.pdf";

      // Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Callback with File for stepper integration
      if (onGenerated) {
        const file = new File([blob], filename, { type: "application/pdf" });
        onGenerated(file);
      }

      toast.success("Contrato gerado com sucesso!");
      setOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao gerar contrato";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [
    template,
    prefill,
    companyName,
    companyCnpj,
    companyAddress,
    contracteeName,
    contracteeCnpj,
    contracteeCpf,
    contracteeAddress,
    paymentConditions,
    penaltyPercent,
    customClause,
    onGenerated,
  ]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <IconSparkles className="h-4 w-4 mr-1.5" />
          {label}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconFileTypePdf className="h-5 w-5 text-red-500" />
            Gerador de Contratos
          </DialogTitle>
          <DialogDescription>
            Selecione o modelo e preencha os dados complementares para gerar o PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Template selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <IconTemplate className="h-3.5 w-3.5" />
              Modelo do Contrato
            </Label>
            <Select
              value={template}
              onValueChange={(v) => setTemplate(v as ContractTemplateKey)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONTRACT_TEMPLATES).map(([key, tmpl]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex flex-col">
                      <span>{tmpl.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {tmpl.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview of pre-filled data */}
          {prefill?.title && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Dados do contrato (pre-preenchidos)
              </p>
              <p className="text-sm font-medium">{prefill.title}</p>
              {prefill.totalValue !== undefined && prefill.totalValue > 0 && (
                <p className="text-sm text-muted-foreground">
                  Valor: R$ {prefill.totalValue.toLocaleString("pt-BR")}
                </p>
              )}
              {prefill.scopeItems && prefill.scopeItems.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {prefill.scopeItems.length} item(ns) de escopo
                </p>
              )}
              {prefill.signers && prefill.signers.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {prefill.signers.length} signatario(s)
                </p>
              )}
            </div>
          )}

          {/* Complementary data */}
          <Accordion type="multiple" defaultValue={["contratante"]}>
            {/* Contratante */}
            <AccordionItem value="contratante">
              <AccordionTrigger className="text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <IconBuilding className="h-3.5 w-3.5" />
                  Dados do Contratante
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Razao Social</Label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="TBO Agencia de Comunicacao Ltda."
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">CNPJ</Label>
                    <Input
                      value={companyCnpj}
                      onChange={(e) => setCompanyCnpj(e.target.value)}
                      placeholder="00.000.000/0001-00"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Endereco</Label>
                  <Input
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="Rua, numero, cidade - UF"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Contratado */}
            <AccordionItem value="contratado">
              <AccordionTrigger className="text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <IconUser className="h-3.5 w-3.5" />
                  Dados do Contratado(a)
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="space-y-1">
                  <Label className="text-xs">Nome / Razao Social</Label>
                  <Input
                    value={contracteeName}
                    onChange={(e) => setContracteeName(e.target.value)}
                    placeholder="Nome completo ou razao social"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">CNPJ</Label>
                    <Input
                      value={contracteeCnpj}
                      onChange={(e) => setContracteeCnpj(e.target.value)}
                      placeholder="00.000.000/0001-00"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">CPF</Label>
                    <Input
                      value={contracteeCpf}
                      onChange={(e) => setContracteeCpf(e.target.value)}
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Endereco</Label>
                  <Input
                    value={contracteeAddress}
                    onChange={(e) => setContracteeAddress(e.target.value)}
                    placeholder="Rua, numero, cidade - UF"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Payment & Penalty */}
            <AccordionItem value="pagamento">
              <AccordionTrigger className="text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <IconCoin className="h-3.5 w-3.5" />
                  Pagamento e Multa
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="space-y-1">
                  <Label className="text-xs">Condicoes de Pagamento</Label>
                  <Textarea
                    value={paymentConditions}
                    onChange={(e) => setPaymentConditions(e.target.value)}
                    placeholder="Ex: Pagamento em 3 parcelas iguais, via PIX..."
                    rows={3}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Multa Rescisoria (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={penaltyPercent}
                    onChange={(e) => setPenaltyPercent(Number(e.target.value))}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Custom clause */}
            <AccordionItem value="clausula">
              <AccordionTrigger className="text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <IconClipboardText className="h-3.5 w-3.5" />
                  Clausula Adicional
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="space-y-1">
                  <Label className="text-xs">Texto da clausula extra</Label>
                  <Textarea
                    value={customClause}
                    onChange={(e) => setCustomClause(e.target.value)}
                    placeholder="Digite aqui uma clausula adicional que sera incluida no contrato..."
                    rows={4}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Generate button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <IconFileTypePdf className="h-4 w-4 mr-2" />
                Gerar e Baixar PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapTypeToTemplate(type: string): ContractTemplateKey {
  const map: Record<string, ContractTemplateKey> = {
    pj: "pj",
    nda: "nda",
    freelancer: "freelancer",
    clt: "clt",
    aditivo: "aditivo",
  };
  return map[type] ?? "generico";
}
