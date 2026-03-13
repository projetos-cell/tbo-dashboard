"use client";

import { use } from "react";
import Link from "next/link";
import { IconArrowLeft, IconSend, IconCircleX, IconBell, IconFileText, IconDownload } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useContract } from "@/features/contratos/hooks/use-contracts";
import { useScopeItems, useUpdateScopeItem } from "@/features/contratos/hooks/use-contract-scope";
import { useContractSigners } from "@/features/contratos/hooks/use-contract-signers";
import { useContractEvents } from "@/features/contratos/hooks/use-contract-events";
import {
  useSendToClicksign,
  useCancelClicksignEnvelope,
  useNotifyClicksignSigners,
} from "@/features/contratos/hooks/use-clicksign";
import { ContractStatusBadge } from "@/features/contratos/components/contract-status-badge";
import { ScopeItemsTable } from "@/features/contratos/components/scope-items-table";
import { SignersList } from "@/features/contratos/components/signers-list";
import { ContractTimeline } from "@/features/contratos/components/contract-timeline";
import { ScopeProgressBar } from "@/features/contratos/components/scope-progress-bar";
import { CONTRACT_CATEGORY, CONTRACT_TYPE } from "@/lib/constants";

interface PageProps {
  params: Promise<{ contractId: string }>;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ContractDetailPage({ params }: PageProps) {
  const { contractId } = use(params);

  const { data: contract, isLoading: loadingContract } = useContract(contractId);
  const { data: scopeItems = [], isLoading: loadingScope } = useScopeItems(contractId);
  const { data: signers = [], isLoading: loadingSigners } = useContractSigners(contractId);
  const { data: events = [], isLoading: loadingEvents } = useContractEvents(contractId);

  const updateScope = useUpdateScopeItem();
  const sendToClicksign = useSendToClicksign();
  const cancelClicksign = useCancelClicksignEnvelope();
  const notifySigners = useNotifyClicksignSigners();

  if (loadingContract) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Contrato nao encontrado</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/contratos">Voltar</Link>
        </Button>
      </div>
    );
  }

  const c = contract as Record<string, unknown>;
  const title = c.title as string;
  const category = c.category as string | null;
  const type = c.type as string | null;
  const contractStatus = (c.contract_status as string) ?? (c.status as string) ?? "draft";
  const clicksignStatus = (c.clicksign_status as string) ?? "draft";
  const totalValue = (c.total_value as number) ?? (c.monthly_value as number) ?? 0;
  const startDate = c.start_date as string | null;
  const endDate = c.end_date as string | null;
  const fileUrl = c.file_url as string | null;
  const fileName = c.file_name as string | null;
  const contractNumber = c.contract_number as string | null;
  const description = c.description as string | null;
  const envelopeId = c.clicksign_envelope_id as string | null;

  const isRunning = clicksignStatus === "running";
  const isDraft = contractStatus === "draft";
  const canSend = isDraft && !envelopeId;
  const canCancel = isRunning && !!envelopeId;
  const canNotify = isRunning && !!envelopeId;

  // Weighted progress from scope items
  const totalScopeValue = (scopeItems as Array<{ value: number; progress_pct: number }>).reduce(
    (sum, item) => sum + item.value,
    0
  );
  const weightedProgress =
    totalScopeValue > 0
      ? (scopeItems as Array<{ value: number; progress_pct: number }>).reduce(
          (sum, item) => sum + item.progress_pct * item.value,
          0
        ) / totalScopeValue
      : 0;

  const categoryLabel =
    category && CONTRACT_CATEGORY[category as keyof typeof CONTRACT_CATEGORY]
      ? CONTRACT_CATEGORY[category as keyof typeof CONTRACT_CATEGORY].label
      : category ?? "—";

  const typeLabel =
    type && CONTRACT_TYPE[type as keyof typeof CONTRACT_TYPE]
      ? CONTRACT_TYPE[type as keyof typeof CONTRACT_TYPE].label
      : type ?? "—";

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/contratos">
              <IconArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {contractNumber && (
                <Badge variant="outline" className="shrink-0 font-mono text-xs">
                  {contractNumber}
                </Badge>
              )}
              <ContractStatusBadge status={contractStatus} type="contract" />
              <ContractStatusBadge status={clicksignStatus} type="clicksign" />
            </div>
            <h1 className="text-xl font-semibold truncate">{title}</h1>
            <p className="text-sm text-muted-foreground">
              {categoryLabel} | {typeLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canSend && (
            <Button
              size="sm"
              onClick={() => sendToClicksign.mutate(contractId)}
              disabled={sendToClicksign.isPending}
            >
              <IconSend className="h-4 w-4 mr-1" />
              Enviar para Assinatura
            </Button>
          )}
          {canNotify && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => notifySigners.mutate(contractId)}
              disabled={notifySigners.isPending}
            >
              <IconBell className="h-4 w-4 mr-1" />
              Lembrete
            </Button>
          )}
          {canCancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => cancelClicksign.mutate(contractId)}
              disabled={cancelClicksign.isPending}
            >
              <IconCircleX className="h-4 w-4 mr-1" />
              Cancelar Envelope
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Valor Total</p>
            <p className="text-lg font-semibold">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Progresso</p>
            <ScopeProgressBar progress={weightedProgress} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Periodo</p>
            <p className="text-sm font-medium">
              {startDate
                ? new Date(startDate).toLocaleDateString("pt-BR")
                : "—"}{" "}
              ate{" "}
              {endDate
                ? new Date(endDate).toLocaleDateString("pt-BR")
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Documento</p>
            {fileUrl ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <IconDownload className="h-3.5 w-3.5" />
                {fileName ?? "Download"}
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum arquivo</p>
            )}
          </CardContent>
        </Card>
      </div>

      {description && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm whitespace-pre-wrap">{description}</p>
          </CardContent>
        </Card>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Scope + Signers */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Escopo</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingScope ? (
                <div className="space-y-3">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : (
                <ScopeItemsTable
                  items={scopeItems as Array<{
                    id: string;
                    title: string;
                    description?: string | null;
                    category?: string | null;
                    value: number;
                    status: string;
                    progress_pct: number;
                    estimated_start?: string | null;
                    estimated_end?: string | null;
                  }>}
                  onUpdate={(id, updates) =>
                    updateScope.mutate({
                      id,
                      contractId,
                      updates: updates as never,
                    })
                  }
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Signatarios</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSigners ? (
                <div className="space-y-3">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : (
                <SignersList
                  signers={signers as Array<{
                    id: string;
                    name: string;
                    email: string;
                    cpf?: string | null;
                    role: string;
                    sign_status: string;
                    signed_at?: string | null;
                  }>}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Timeline */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingEvents ? (
                <div className="space-y-3">
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                </div>
              ) : (
                <ContractTimeline
                  events={events as Array<{
                    id: string;
                    event_type: string;
                    description: string | null;
                    metadata?: Record<string, unknown> | null;
                    created_at: string;
                  }>}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
