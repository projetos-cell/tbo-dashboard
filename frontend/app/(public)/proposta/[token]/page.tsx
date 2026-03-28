"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  IconThumbUp,
  IconThumbDown,
  IconFileText,
  IconUser,
  IconMapPin,
  IconBriefcase,
  IconCalendar,
  IconAlertCircle,
  IconLoader2,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { createClient } from "@/lib/supabase/client";
import {
  getProposalByToken,
  submitClientDecision,
  type ClientLinkProposal,
} from "@/features/comercial/services/proposal-client-link";
import { useQuery, useMutation } from "@tanstack/react-query";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ProposalSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-zinc-200 rounded-xl" />
          <div className="h-32 bg-zinc-200 rounded-xl" />
          <div className="h-64 bg-zinc-200 rounded-xl" />
          <div className="h-20 bg-zinc-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Decided state ────────────────────────────────────────────────────────────

function DecidedState({ decision }: { decision: "approved" | "rejected" }) {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-sm"
      >
        <div
          className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${
            decision === "approved" ? "bg-emerald-100" : "bg-red-100"
          }`}
        >
          {decision === "approved" ? (
            <IconThumbUp size={32} className="text-emerald-600" />
          ) : (
            <IconThumbDown size={32} className="text-red-500" />
          )}
        </div>
        <h2 className="text-xl font-bold text-zinc-900 mb-2">
          {decision === "approved" ? "Proposta Aprovada!" : "Proposta Recusada"}
        </h2>
        <p className="text-zinc-500 text-sm">
          {decision === "approved"
            ? "Obrigado! Nossa equipe entrará em contato em breve para dar início ao projeto."
            : "Agradecemos pela consideração. Se mudar de ideia ou quiser renegociar, entre em contato."}
        </p>
        <div className="mt-6 text-xs text-zinc-400">
          <p className="font-semibold text-zinc-600">TBO — The Branding Office</p>
          <p>contato@agenciatbo.com.br</p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Proposal view ────────────────────────────────────────────────────────────

function ProposalView({
  proposal,
  onDecide,
  isSubmitting,
}: {
  proposal: ClientLinkProposal;
  onDecide: (decision: "approved" | "rejected", feedback: string) => void;
  isSubmitting: boolean;
}) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const isDecided = ["approved", "rejected"].includes(proposal.status);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* TBO Header bar */}
      <div className="bg-[#18181B] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-lg font-bold tracking-wide">TBO</p>
          <p className="text-xs text-zinc-400 tracking-widest uppercase">The Branding Office</p>
        </div>
        {proposal.ref_code && (
          <div className="text-right">
            <p className="text-xs text-zinc-400 uppercase tracking-wider">Referência</p>
            <p className="text-[#E85102] font-bold font-mono">{proposal.ref_code}</p>
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Decided banner */}
        {isDecided && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 flex items-center gap-3 ${
              proposal.status === "approved"
                ? "bg-emerald-50 border border-emerald-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            {proposal.status === "approved" ? (
              <IconThumbUp size={20} className="text-emerald-600 shrink-0" />
            ) : (
              <IconThumbDown size={20} className="text-red-500 shrink-0" />
            )}
            <div>
              <p className={`font-semibold ${proposal.status === "approved" ? "text-emerald-700" : "text-red-600"}`}>
                {proposal.status === "approved" ? "Proposta aprovada" : "Proposta recusada"}
              </p>
              {proposal.client_decided_at && (
                <p className="text-xs text-zinc-400 mt-0.5">
                  Decisão em {formatDate(proposal.client_decided_at)}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Proposal header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-xl border p-6 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-zinc-900">{proposal.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {proposal.company && (
                  <span className="flex items-center gap-1 text-sm text-zinc-500">
                    <IconBriefcase size={14} />
                    {proposal.company}
                  </span>
                )}
                {proposal.project_type && (
                  <span className="flex items-center gap-1 text-sm text-zinc-500">
                    <IconFileText size={14} />
                    {proposal.project_type}
                  </span>
                )}
                {proposal.project_location && (
                  <span className="flex items-center gap-1 text-sm text-zinc-500">
                    <IconMapPin size={14} />
                    {proposal.project_location}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-zinc-400 mb-1">
                <IconCalendar size={12} className="inline mr-1" />
                Emitida em {formatDate(proposal.created_at)}
              </p>
              {proposal.valid_days > 0 && (
                <Badge variant="outline" className="text-xs">
                  Válida por {proposal.valid_days} dias
                </Badge>
              )}
            </div>
          </div>

          {/* Contact info */}
          {(proposal.contact_name || proposal.contact_email || proposal.contact_phone) && (
            <div className="mt-4 pt-4 border-t flex flex-wrap gap-4">
              {proposal.contact_name && (
                <span className="flex items-center gap-1.5 text-sm text-zinc-600">
                  <IconUser size={14} className="text-zinc-400" />
                  {proposal.contact_name}
                </span>
              )}
              {proposal.contact_email && (
                <a
                  href={`mailto:${proposal.contact_email}`}
                  className="text-sm text-[#E85102] hover:underline"
                >
                  {proposal.contact_email}
                </a>
              )}
              {proposal.contact_phone && (
                <span className="text-sm text-zinc-600">{proposal.contact_phone}</span>
              )}
            </div>
          )}
        </motion.div>

        {/* Items */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="bg-white rounded-xl border shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b bg-zinc-50">
            <h2 className="font-semibold text-zinc-900">Escopo de Serviços</h2>
          </div>
          <div className="divide-y">
            {proposal.items.map((item) => (
              <div key={item.id} className="px-6 py-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-900">{item.title}</p>
                  {item.description && (
                    <p className="text-sm text-zinc-500 mt-0.5">{item.description}</p>
                  )}
                  {item.bu && (
                    <Badge variant="outline" className="text-xs mt-1.5">
                      {item.bu}
                    </Badge>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-zinc-900">{formatCurrency(item.subtotal)}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {item.quantity}× {formatCurrency(item.unit_price)}
                    {item.discount_pct > 0 && ` − ${item.discount_pct}%`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Totals */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="bg-white rounded-xl border shadow-sm p-6"
        >
          <div className="flex flex-col gap-2 max-w-xs ml-auto">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Subtotal</span>
              <span className="font-medium">{formatCurrency(proposal.subtotal)}</span>
            </div>
            {proposal.discount_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Desconto</span>
                <span className="text-red-500 font-medium">
                  − {formatCurrency(proposal.discount_amount)}
                </span>
              </div>
            )}
            {proposal.urgency_flag && (
              <div className="flex justify-between text-sm">
                <span className="text-amber-600 font-medium">⚡ Urgência aplicada</span>
              </div>
            )}
            <Separator className="my-1" />
            <div className="flex justify-between">
              <span className="font-bold text-zinc-900">Valor Total</span>
              <span className="font-bold text-[#E85102] text-lg">{formatCurrency(proposal.value)}</span>
            </div>
          </div>
        </motion.div>

        {/* Notes */}
        {proposal.notes && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            className="bg-white rounded-xl border shadow-sm p-6"
          >
            <h3 className="font-semibold text-zinc-900 mb-2">Observações</h3>
            <p className="text-sm text-zinc-600 whitespace-pre-line">{proposal.notes}</p>
          </motion.div>
        )}

        {/* Decision actions */}
        {!isDecided && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.2 }}
            className="bg-white rounded-xl border shadow-sm p-6"
          >
            <h3 className="font-semibold text-zinc-900 mb-1">Sua decisão</h3>
            <p className="text-sm text-zinc-500 mb-4">
              Revise a proposta acima e indique sua decisão.
            </p>
            <div className="flex gap-3">
              <Button
                className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setApproveOpen(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconThumbUp size={16} />
                )}
                Aprovar proposta
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => setRejectOpen(true)}
                disabled={isSubmitting}
              >
                <IconThumbDown size={16} />
                Recusar
              </Button>
            </div>
          </motion.div>
        )}

        {/* Client feedback (if already decided) */}
        {isDecided && proposal.client_feedback && (
          <div className="bg-zinc-50 rounded-xl border p-4">
            <p className="text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wide">Seu feedback</p>
            <p className="text-sm text-zinc-700">{proposal.client_feedback}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-zinc-400">
            TBO — The Branding Office · contato@agenciatbo.com.br
          </p>
          <p className="text-xs text-zinc-300 mt-1">
            Esta proposta foi gerada pelo TBO OS e é válida por {proposal.valid_days} dias.
          </p>
        </div>
      </div>

      {/* Approve dialog */}
      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <IconThumbUp size={20} className="text-emerald-600" />
              Aprovar proposta?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ao aprovar, nossa equipe será notificada e entrará em contato para dar início ao projeto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Deixe um comentário ou observação (opcional)..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            className="mt-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFeedback("")}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                onDecide("approved", feedback);
                setApproveOpen(false);
              }}
            >
              Confirmar aprovação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject dialog */}
      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <IconAlertCircle size={20} className="text-red-500" />
              Recusar proposta?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Podemos renegociar os termos se necessário. Deixe um comentário explicando sua decisão.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Motivo da recusa ou sugestão de ajuste (opcional)..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            className="mt-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFeedback("")}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                onDecide("rejected", feedback);
                setRejectOpen(false);
              }}
            >
              Confirmar recusa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProposalPublicPage() {
  const params = useParams();
  const token = params.token as string;

  const [decidedStatus, setDecidedStatus] = useState<"approved" | "rejected" | null>(null);

  const { data: proposal, isLoading, error } = useQuery({
    queryKey: ["proposal-by-token-public", token],
    queryFn: async () => {
      const supabase = createClient();
      return getProposalByToken(supabase, token);
    },
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60,
  });

  const decideMutation = useMutation({
    mutationFn: async ({
      decision,
      feedback,
    }: {
      decision: "approved" | "rejected";
      feedback: string;
    }) => {
      const supabase = createClient();
      return submitClientDecision(supabase, token, { decision, feedback });
    },
    onSuccess: (_data, { decision }) => {
      setDecidedStatus(decision);
    },
  });

  if (isLoading) return <ProposalSkeleton />;

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <IconAlertCircle size={40} className="text-zinc-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-zinc-900 mb-1">Link inválido</h2>
          <p className="text-zinc-500 text-sm">
            Esta proposta não foi encontrada ou o link expirou. Entre em contato com a TBO.
          </p>
          <p className="mt-4 text-xs text-zinc-400">contato@agenciatbo.com.br</p>
        </div>
      </div>
    );
  }

  if (decidedStatus) {
    return <DecidedState decision={decidedStatus} />;
  }

  return (
    <ProposalView
      proposal={proposal}
      onDecide={(decision, feedback) => decideMutation.mutate({ decision, feedback })}
      isSubmitting={decideMutation.isPending}
    />
  );
}
