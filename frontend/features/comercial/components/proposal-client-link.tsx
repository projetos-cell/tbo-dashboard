"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IconLink,
  IconCopy,
  IconCheck,
  IconEye,
  IconThumbUp,
  IconThumbDown,
  IconClock,
  IconSend,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useProposal } from "@/features/comercial/hooks/use-proposals";
import { useGenerateClientToken } from "@/features/comercial/hooks/use-proposals-enhanced";
import type { ProposalStatus } from "@/features/comercial/services/proposals";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildShareUrl(token: string): string {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "";
  return `${base}/proposta/${token}`;
}

function DecisionBadge({ status }: { status: ProposalStatus }) {
  if (status === "approved") {
    return (
      <Badge className="gap-1 bg-emerald-100 text-emerald-700 border-emerald-200">
        <IconThumbUp size={12} /> Aprovada
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge variant="destructive" className="gap-1">
        <IconThumbDown size={12} /> Rejeitada
      </Badge>
    );
  }
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ProposalClientLinkProps {
  proposalId: string;
}

export function ProposalClientLink({ proposalId }: ProposalClientLinkProps) {
  const { data: proposal, isLoading } = useProposal(proposalId);
  const generateToken = useGenerateClientToken();
  const [copied, setCopied] = useState(false);

  const extProposal = proposal as typeof proposal & {
    client_token?: string | null;
    client_viewed_at?: string | null;
    client_decided_at?: string | null;
    client_feedback?: string | null;
    sent_at?: string | null;
  };

  const token = extProposal?.client_token;
  const shareUrl = token ? buildShareUrl(token) : null;

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <IconLink size={18} className="text-zinc-500" />
        <CardTitle className="text-base">Link do Cliente</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Decision status */}
        {extProposal && (
          <div className="flex items-center gap-2">
            <DecisionBadge status={extProposal.status} />
            {extProposal.status === "sent" && (
              <Badge variant="outline" className="gap-1 text-zinc-500">
                <IconSend size={12} /> Aguardando resposta
              </Badge>
            )}
          </div>
        )}

        {/* View log */}
        <div className="space-y-2">
          {extProposal?.sent_at && (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <IconSend size={14} />
              <span>
                Enviada em{" "}
                {format(new Date(extProposal.sent_at), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </span>
            </div>
          )}

          {extProposal?.client_viewed_at ? (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <IconEye size={14} />
              <span>
                Visualizada em{" "}
                {format(new Date(extProposal.client_viewed_at), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <IconEye size={14} />
              <span>Ainda não visualizada</span>
            </div>
          )}

          {extProposal?.client_decided_at && (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <IconClock size={14} />
              <span>
                Decisão em{" "}
                {format(new Date(extProposal.client_decided_at), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </span>
            </div>
          )}
        </div>

        {/* Client feedback */}
        {extProposal?.client_feedback && (
          <div className="rounded-lg bg-zinc-50 border p-3">
            <p className="text-xs font-medium text-zinc-500 mb-1">Feedback do cliente</p>
            <p className="text-sm text-zinc-700">{extProposal.client_feedback}</p>
          </div>
        )}

        {/* Link area */}
        {shareUrl ? (
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly className="font-mono text-xs text-zinc-500" />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              title="Copiar link"
              className="shrink-0"
            >
              {copied ? (
                <IconCheck size={16} className="text-emerald-500" />
              ) : (
                <IconCopy size={16} />
              )}
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-center">
            <p className="text-sm text-zinc-400 mb-3">
              Gere um link seguro para o cliente visualizar e aprovar a proposta.
            </p>
            <Button
              size="sm"
              onClick={() => generateToken.mutate(proposalId)}
              disabled={generateToken.isPending}
              className="gap-1.5"
            >
              <IconLink size={14} />
              {generateToken.isPending ? "Gerando..." : "Gerar link do cliente"}
            </Button>
          </div>
        )}

        {/* Regenerate */}
        {shareUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-zinc-400 hover:text-zinc-600"
            onClick={() => generateToken.mutate(proposalId)}
            disabled={generateToken.isPending}
          >
            {generateToken.isPending ? "Gerando novo link..." : "Gerar novo link (invalida o anterior)"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
