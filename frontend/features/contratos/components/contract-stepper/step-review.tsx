"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Users, ListChecks, Calendar, DollarSign } from "lucide-react";
import { CONTRACT_CATEGORY, CONTRACT_TYPE } from "@/lib/constants";
import {
  SCOPE_CATEGORIES,
  SIGNER_ROLE,
} from "../../schemas/contract-schemas";
import type { ContractBasicsInput, ScopeItemInput, SignerInput } from "../../schemas/contract-schemas";

interface StepReviewProps {
  basics: ContractBasicsInput;
  scopeItems: ScopeItemInput[];
  signers: SignerInput[];
  file: File | null;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function StepReview({
  basics,
  scopeItems,
  signers,
  file,
}: StepReviewProps) {
  const totalScope = scopeItems.reduce((sum, item) => sum + (item.value ?? 0), 0);
  const categoryLabel =
    basics.category && CONTRACT_CATEGORY[basics.category as keyof typeof CONTRACT_CATEGORY]
      ? CONTRACT_CATEGORY[basics.category as keyof typeof CONTRACT_CATEGORY].label
      : basics.category ?? "—";
  const typeLabel =
    basics.type && CONTRACT_TYPE[basics.type as keyof typeof CONTRACT_TYPE]
      ? CONTRACT_TYPE[basics.type as keyof typeof CONTRACT_TYPE].label
      : basics.type ?? "—";

  return (
    <div className="space-y-6">
      {/* Dados Basicos */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Dados Basicos
        </h3>
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Titulo</span>
            <span className="font-medium">{basics.title || "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Categoria</span>
            <Badge variant="secondary">{categoryLabel}</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tipo</span>
            <Badge variant="outline">{typeLabel}</Badge>
          </div>
          {basics.total_value > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valor Total</span>
              <span className="font-medium">
                {formatCurrency(basics.total_value)}
              </span>
            </div>
          )}
          {(basics.start_date || basics.end_date) && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Periodo</span>
              <span className="font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {basics.start_date ?? "—"} ate {basics.end_date ?? "—"}
              </span>
            </div>
          )}
        </div>
      </section>

      <Separator />

      {/* Escopo */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-muted-foreground" />
          Escopo ({scopeItems.length} itens)
        </h3>
        {scopeItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum item de escopo</p>
        ) : (
          <div className="rounded-lg border bg-card divide-y">
            {scopeItems.map((item, i) => (
              <div key={i} className="p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  {item.category && (
                    <p className="text-xs text-muted-foreground">
                      {SCOPE_CATEGORIES.find((c) => c.value === item.category)
                        ?.label ?? item.category}
                    </p>
                  )}
                </div>
                <span className="text-sm font-medium shrink-0 ml-2">
                  {formatCurrency(item.value ?? 0)}
                </span>
              </div>
            ))}
            <div className="p-3 flex items-center justify-between bg-muted/50">
              <span className="text-sm font-semibold">Total Escopo</span>
              <span className="text-sm font-semibold flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {formatCurrency(totalScope)}
              </span>
            </div>
          </div>
        )}
      </section>

      <Separator />

      {/* Signatarios */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          Signatarios ({signers.length})
        </h3>
        {signers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum signatario</p>
        ) : (
          <div className="rounded-lg border bg-card divide-y">
            {signers.map((signer, i) => (
              <div key={i} className="p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{signer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {signer.email}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 ml-2">
                  {SIGNER_ROLE[signer.role]?.label ?? signer.role}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>

      <Separator />

      {/* Documento */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Documento
        </h3>
        {file ? (
          <div className="rounded-lg border bg-card p-3 flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum documento anexado (pode ser adicionado depois)
          </p>
        )}
      </section>
    </div>
  );
}
