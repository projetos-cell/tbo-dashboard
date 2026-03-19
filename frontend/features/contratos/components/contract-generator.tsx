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
  IconRobot,
  IconWand,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CONTRACT_TEMPLATES, TBO_DEFAULTS } from "../templates/types";
import type {
  ContractPdfData,
  ContractPdfScopeItem,
  ContractPdfSigner,
  ContractTemplateKey,
} from "../templates/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ContractGeneratorProps {
  prefill?: Partial<ContractPdfData>;
  onGenerated?: (file: File) => void;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  label?: string;
}

// ─── AI response type ─────────────────────────────────────────────────────────

interface AiAssistResponse {
  objectClause?: string;
  scopeDetails?: string;
  paymentStructure?: string;
  suggestions?: string[];
  reviewNotes?: string;
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
  const [aiLoading, setAiLoading] = useState(false);
  const [template, setTemplate] = useState<ContractTemplateKey>(
    mapTypeToTemplate(prefill?.type ?? "generico")
  );

  // Editable fields
  const [companyName, setCompanyName] = useState(
    prefill?.companyName ?? TBO_DEFAULTS.companyName
  );
  const [companyCnpj, setCompanyCnpj] = useState(
    prefill?.companyCnpj ?? TBO_DEFAULTS.companyCnpj
  );
  const [companyAddress, setCompanyAddress] = useState(
    prefill?.companyAddress ?? TBO_DEFAULTS.companyAddress
  );
  const [contracteeName, setContracteeName] = useState(prefill?.contracteeName ?? "");
  const [contracteeCnpj, setContracteeCnpj] = useState(prefill?.contracteeCnpj ?? "");
  const [contracteeCpf, setContracteeCpf] = useState(prefill?.contracteeCpf ?? "");
  const [contracteeAddress, setContracteeAddress] = useState(prefill?.contracteeAddress ?? "");
  const [paymentConditions, setPaymentConditions] = useState(prefill?.paymentConditions ?? "");
  const [penaltyPercent, setPenaltyPercent] = useState(prefill?.penaltyPercent ?? TBO_DEFAULTS.penaltyPercent);
  const [customClause, setCustomClause] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");

  // AI-generated content
  const [aiObject, setAiObject] = useState("");
  const [aiScope, setAiScope] = useState("");
  const [aiPayment, setAiPayment] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // ── AI assist ───────────────────────────────────────────────────

  const handleAiAssist = useCallback(
    async (action: "object" | "scope" | "payment" | "full") => {
      setAiLoading(true);
      try {
        const response = await fetch("/api/ai/contract-assist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            context: {
              title: prefill?.title ?? "Contrato",
              description: prefill?.description,
              category: prefill?.category ?? "cliente",
              type: prefill?.type ?? "pj",
              totalValue: prefill?.totalValue ?? 0,
              scopeItems: prefill?.scopeItems?.map((i) => ({
                title: i.title,
                description: i.description,
                value: i.value,
              })),
              signers: prefill?.signers?.map((s) => ({
                name: s.name,
                role: s.role,
              })),
              startDate: prefill?.startDate,
              endDate: prefill?.endDate,
            },
            instructions: aiInstructions || undefined,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error ?? "Erro na IA");
        }

        const data: AiAssistResponse = await response.json();

        if (data.objectClause) setAiObject(data.objectClause);
        if (data.scopeDetails) setAiScope(data.scopeDetails);
        if (data.paymentStructure) {
          setAiPayment(data.paymentStructure);
          setPaymentConditions(data.paymentStructure);
        }
        if (data.suggestions) setAiSuggestions(data.suggestions);

        toast.success(
          action === "full"
            ? "Clausulas geradas pela IA!"
            : "Sugestao gerada pela IA!"
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro no assistente";
        toast.error(message);
      } finally {
        setAiLoading(false);
      }
    },
    [prefill, aiInstructions]
  );

  // ── Generate PDF ────────────────────────────────────────────────

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
        // AI-generated
        aiObjectClause: aiObject || undefined,
        aiScopeDetails: aiScope || undefined,
        aiPaymentStructure: aiPayment || undefined,
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

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

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
    aiObject,
    aiScope,
    aiPayment,
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
            Modelo TBO com 13 clausulas. Use a IA para gerar clausulas automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Template + Preview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <IconTemplate className="h-3 w-3" />
                Modelo
              </Label>
              <Select
                value={template}
                onValueChange={(v) => setTemplate(v as ContractTemplateKey)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONTRACT_TEMPLATES).map(([key, tmpl]) => (
                    <SelectItem key={key} value={key}>
                      {tmpl.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {prefill?.title && (
              <div className="rounded-lg border bg-muted/30 p-2.5">
                <p className="text-xs font-medium truncate">{prefill.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  {prefill.totalValue !== undefined && prefill.totalValue > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      R$ {prefill.totalValue.toLocaleString("pt-BR")}
                    </Badge>
                  )}
                  {prefill.scopeItems && prefill.scopeItems.length > 0 && (
                    <Badge variant="outline" className="text-[10px]">
                      {prefill.scopeItems.length} itens
                    </Badge>
                  )}
                  {prefill.signers && prefill.signers.length > 0 && (
                    <Badge variant="outline" className="text-[10px]">
                      {prefill.signers.length} signat.
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── AI Assist section ─────────────────────────────── */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <IconRobot className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Assistente IA</span>
              <Badge variant="secondary" className="text-[10px]">Claude</Badge>
            </div>

            <Textarea
              value={aiInstructions}
              onChange={(e) => setAiInstructions(e.target.value)}
              placeholder="Instrucoes adicionais para a IA (opcional). Ex: 'Contrato de branding para lancamento imobiliario de alto padrao...'"
              rows={2}
              className="text-xs bg-background"
            />

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleAiAssist("full")}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <IconLoader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <IconWand className="h-3 w-3 mr-1" />
                )}
                Gerar Tudo
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleAiAssist("object")}
                disabled={aiLoading}
              >
                Clausula Objeto
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleAiAssist("scope")}
                disabled={aiLoading}
              >
                Detalhar Escopo
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleAiAssist("payment")}
                disabled={aiLoading}
              >
                Sugerir Pagamento
              </Button>
            </div>

            {/* AI generated previews */}
            {(aiObject || aiScope || aiPayment) && (
              <div className="space-y-2 pt-1">
                {aiObject && (
                  <div className="rounded border bg-background p-2">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1">Objeto (IA)</p>
                    <p className="text-xs line-clamp-3">{aiObject}</p>
                  </div>
                )}
                {aiScope && (
                  <div className="rounded border bg-background p-2">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1">Escopo (IA)</p>
                    <p className="text-xs line-clamp-3">{aiScope}</p>
                  </div>
                )}
                {aiPayment && (
                  <div className="rounded border bg-background p-2">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1">Pagamento (IA)</p>
                    <p className="text-xs line-clamp-3">{aiPayment}</p>
                  </div>
                )}
              </div>
            )}

            {aiSuggestions.length > 0 && (
              <div className="rounded border bg-background p-2">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">Sugestoes</p>
                {aiSuggestions.map((s, i) => (
                  <p key={i} className="text-xs text-muted-foreground">{s}</p>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* ── Complementary data ────────────────────────────── */}
          <Accordion type="multiple" defaultValue={[]}>
            <AccordionItem value="contratante">
              <AccordionTrigger className="text-sm py-2">
                <span className="flex items-center gap-1.5">
                  <IconBuilding className="h-3.5 w-3.5" />
                  Contratante
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Razao Social</Label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">CNPJ</Label>
                    <Input
                      value={companyCnpj}
                      onChange={(e) => setCompanyCnpj(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Endereco</Label>
                  <Input
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contratado">
              <AccordionTrigger className="text-sm py-2">
                <span className="flex items-center gap-1.5">
                  <IconUser className="h-3.5 w-3.5" />
                  Contratado(a)
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="space-y-1">
                  <Label className="text-xs">Nome / Razao Social</Label>
                  <Input
                    value={contracteeName}
                    onChange={(e) => setContracteeName(e.target.value)}
                    placeholder="Nome completo ou razao social"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">CNPJ</Label>
                    <Input
                      value={contracteeCnpj}
                      onChange={(e) => setContracteeCnpj(e.target.value)}
                      placeholder="00.000.000/0001-00"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">CPF</Label>
                    <Input
                      value={contracteeCpf}
                      onChange={(e) => setContracteeCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Endereco</Label>
                  <Input
                    value={contracteeAddress}
                    onChange={(e) => setContracteeAddress(e.target.value)}
                    placeholder="Rua, numero, cidade - UF"
                    className="h-8 text-xs"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="pagamento">
              <AccordionTrigger className="text-sm py-2">
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
                    className="text-xs"
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
                    className="h-8 text-xs w-24"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="clausula">
              <AccordionTrigger className="text-sm py-2">
                <span className="flex items-center gap-1.5">
                  <IconClipboardText className="h-3.5 w-3.5" />
                  Clausula Adicional
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <Textarea
                  value={customClause}
                  onChange={(e) => setCustomClause(e.target.value)}
                  placeholder="Texto da clausula extra..."
                  rows={3}
                  className="text-xs"
                />
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
