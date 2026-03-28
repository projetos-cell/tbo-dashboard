"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  IconCheck,
  IconX,
  IconClock,
  IconSkipForward,
  IconGitBranch,
  IconCircleCheck,
  IconCircleX,
} from "@tabler/icons-react";
import { useAuthStore } from "@/stores/auth-store";
import {
  useApprovalSteps,
  useUpdateApprovalStep,
} from "../hooks/use-task-advanced";
import type { ApprovalStep } from "../hooks/use-task-advanced";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const STATUS_CONFIG = {
  pending: {
    label: "Aguardando",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: IconClock,
  },
  approved: {
    label: "Aprovado",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: IconCircleCheck,
  },
  rejected: {
    label: "Rejeitado",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: IconCircleX,
  },
  skipped: {
    label: "Ignorado",
    color: "bg-gray-100 text-gray-500 border-gray-200",
    icon: IconSkipForward,
  },
} as const;

const ROLE_LABELS = {
  revisor: "Revisor",
  aprovador: "Aprovador",
  cliente: "Cliente",
} as const;

interface TaskApprovalWorkflowProps {
  taskId: string;
}

export function TaskApprovalWorkflow({ taskId }: TaskApprovalWorkflowProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const { data: steps, isLoading } = useApprovalSteps(taskId);
  const updateStep = useUpdateApprovalStep(taskId);

  const [decisionDialog, setDecisionDialog] = useState<{
    step: ApprovalStep;
    action: "approved" | "rejected";
  } | null>(null);
  const [feedback, setFeedback] = useState("");

  const nextPendingStep = (steps ?? []).find((s) => s.status === "pending");

  const handleDecision = () => {
    if (!decisionDialog) return;
    updateStep.mutate(
      {
        id: decisionDialog.step.id,
        updates: {
          status: decisionDialog.action,
          feedback: feedback.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setDecisionDialog(null);
          setFeedback("");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!steps || steps.length === 0) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <IconGitBranch size={16} className="text-muted-foreground" />
          <h3 className="text-sm font-semibold">Aprovação</h3>
        </div>
        <div className="rounded-md border border-dashed py-6 text-center">
          <IconGitBranch size={20} className="mx-auto text-muted-foreground/50" />
          <p className="mt-2 text-xs text-muted-foreground">
            Nenhum fluxo de aprovação configurado
          </p>
        </div>
      </div>
    );
  }

  const allApproved = steps.every((s) => s.status === "approved");
  const hasRejection = steps.some((s) => s.status === "rejected");

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <IconGitBranch size={16} className="text-muted-foreground" />
        <h3 className="text-sm font-semibold">Fluxo de Aprovação</h3>
        {allApproved && (
          <Badge className="ml-auto bg-green-100 text-green-700 border-green-200 text-[10px]">
            Aprovado
          </Badge>
        )}
        {hasRejection && !allApproved && (
          <Badge className="ml-auto bg-red-100 text-red-700 border-red-200 text-[10px]">
            Rejeitado
          </Badge>
        )}
      </div>

      {/* Steps */}
      <div className="relative space-y-0">
        {steps.map((step: ApprovalStep, index: number) => {
          const config = STATUS_CONFIG[step.status];
          const StatusIcon = config.icon;
          const isCurrentStep = step.id === nextPendingStep?.id;
          const canDecide = isCurrentStep && step.assignee_id === userId;

          return (
            <div key={step.id} className="relative flex gap-3">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
              )}

              {/* Step indicator */}
              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                  step.status === "approved"
                    ? "border-green-400 bg-green-50"
                    : step.status === "rejected"
                    ? "border-red-400 bg-red-50"
                    : step.status === "skipped"
                    ? "border-gray-300 bg-gray-50"
                    : isCurrentStep
                    ? "border-blue-400 bg-blue-50"
                    : "border-border bg-muted/40"
                }`}
              >
                <StatusIcon
                  size={14}
                  className={
                    step.status === "approved"
                      ? "text-green-600"
                      : step.status === "rejected"
                      ? "text-red-600"
                      : step.status === "skipped"
                      ? "text-gray-400"
                      : isCurrentStep
                      ? "text-blue-600"
                      : "text-muted-foreground"
                  }
                />
              </div>

              {/* Step content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">
                        Etapa {step.step_order + 1} — {ROLE_LABELS[step.role_label]}
                      </span>
                      <span
                        className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${config.color}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    {step.assignee && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={step.assignee.avatar_url ?? undefined} />
                          <AvatarFallback className="text-[8px]">
                            {getInitials(step.assignee.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[11px] text-muted-foreground">
                          {step.assignee.full_name}
                        </span>
                      </div>
                    )}
                    {step.feedback && (
                      <p className="mt-1.5 rounded-md bg-muted/60 px-2 py-1 text-xs italic text-muted-foreground">
                        "{step.feedback}"
                      </p>
                    )}
                    {step.decided_at && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {new Date(step.decided_at).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>

                  {canDecide && (
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        className="h-7 bg-green-600 hover:bg-green-700 text-white px-2 text-xs"
                        onClick={() => setDecisionDialog({ step, action: "approved" })}
                      >
                        <IconCheck size={12} className="mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 border-red-200 text-red-600 hover:bg-red-50 px-2 text-xs"
                        onClick={() => setDecisionDialog({ step, action: "rejected" })}
                      >
                        <IconX size={12} className="mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Decision dialog */}
      <Dialog open={!!decisionDialog} onOpenChange={() => setDecisionDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {decisionDialog?.action === "approved" ? "Aprovar etapa" : "Rejeitar etapa"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Etapa {(decisionDialog?.step.step_order ?? 0) + 1} —{" "}
              {ROLE_LABELS[decisionDialog?.step.role_label ?? "revisor"]}
            </p>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Feedback opcional..."
              className="min-h-[80px] text-xs"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDecisionDialog(null)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className={`text-xs ${
                decisionDialog?.action === "approved"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
              onClick={handleDecision}
              disabled={updateStep.isPending}
            >
              {decisionDialog?.action === "approved" ? (
                <>
                  <IconCheck size={12} className="mr-1.5" /> Confirmar aprovação
                </>
              ) : (
                <>
                  <IconX size={12} className="mr-1.5" /> Confirmar rejeição
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
