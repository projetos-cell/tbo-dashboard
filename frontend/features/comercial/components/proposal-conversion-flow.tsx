"use client";

import { IconFileText, IconWriting, IconBriefcase, IconArrowRight, IconExternalLink, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useConversionStatus, useConvertToContract, useConvertToProject } from "@/features/comercial/hooks/use-proposals-enhanced";
import { cn } from "@/lib/utils";

// ─── Step card ────────────────────────────────────────────────────────────────

interface StepProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  done: boolean;
  active: boolean;
  entityId: string | null;
  entityPath: string | null;
  action?: React.ReactNode;
}

function Step({ icon, label, sublabel, done, active, entityId, entityPath, action }: StepProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-4 rounded-xl border transition-colors",
        done && "border-emerald-200 bg-emerald-50",
        active && !done && "border-[#E85102]/30 bg-orange-50",
        !done && !active && "border-zinc-200 bg-zinc-50 opacity-60",
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "p-2 rounded-lg",
            done ? "bg-emerald-100 text-emerald-600" : active ? "bg-orange-100 text-[#E85102]" : "bg-zinc-200 text-zinc-400",
          )}
        >
          {done ? <IconCheck size={16} /> : icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900">{label}</p>
          <p className="text-xs text-zinc-500">{sublabel}</p>
        </div>
      </div>

      {done && entityId && entityPath && (
        <a
          href={entityPath}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 transition-colors mt-1"
        >
          <IconExternalLink size={12} />
          Ver {label.toLowerCase()}
        </a>
      )}

      {!done && active && action}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ProposalConversionFlowProps {
  proposalId: string;
  proposalStatus: string;
}

export function ProposalConversionFlow({ proposalId, proposalStatus }: ProposalConversionFlowProps) {
  const { data: status, isLoading } = useConversionStatus(proposalId);
  const convertToContract = useConvertToContract();
  const convertToProject = useConvertToProject();

  const isApproved = proposalStatus === "approved";

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-44" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <IconArrowRight size={18} className="text-zinc-500" />
        <CardTitle className="text-base">Pipeline de Conversão</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-2">
          {/* Step 1: Proposal */}
          <Step
            icon={<IconFileText size={16} />}
            label="Proposta"
            sublabel={isApproved ? "Aprovada pelo cliente" : "Aguardando aprovação"}
            done={isApproved}
            active={!isApproved}
            entityId={proposalId}
            entityPath={null}
          />

          <div className="flex justify-center">
            <IconArrowRight size={14} className="text-zinc-300 rotate-90" />
          </div>

          {/* Step 2: Contract */}
          <Step
            icon={<IconWriting size={16} />}
            label="Contrato"
            sublabel={
              status?.hasContract
                ? `ID: ${status.contractId?.slice(0, 8)}...`
                : isApproved
                ? "Pronto para converter"
                : "Aguarda aprovação da proposta"
            }
            done={!!status?.hasContract}
            active={isApproved && !status?.hasContract}
            entityId={status?.contractId ?? null}
            entityPath={status?.contractId ? `/contratos/${status.contractId}` : null}
            action={
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" className="w-full gap-1.5 bg-[#E85102] hover:bg-[#E85102]/90 text-white">
                    <IconWriting size={14} />
                    Converter em contrato
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Criar contrato?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Um novo contrato será criado com os dados desta proposta. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => convertToContract.mutate(proposalId)}
                      disabled={convertToContract.isPending}
                    >
                      {convertToContract.isPending ? "Criando..." : "Criar contrato"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            }
          />

          <div className="flex justify-center">
            <IconArrowRight size={14} className="text-zinc-300 rotate-90" />
          </div>

          {/* Step 3: Project */}
          <Step
            icon={<IconBriefcase size={16} />}
            label="Projeto"
            sublabel={
              status?.hasProject
                ? `ID: ${status.projectId?.slice(0, 8)}...`
                : status?.hasContract
                ? "Pronto para criar projeto"
                : "Requer contrato ativo"
            }
            done={!!status?.hasProject}
            active={!!status?.hasContract && !status?.hasProject}
            entityId={status?.projectId ?? null}
            entityPath={status?.projectId ? `/projetos/${status.projectId}` : null}
            action={
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    className="w-full gap-1.5 bg-[#18181B] hover:bg-zinc-700 text-white"
                    disabled={!status?.hasContract}
                  >
                    <IconBriefcase size={14} />
                    Criar projeto
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Criar projeto?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Um novo projeto será criado no módulo de Execução com os dados desta proposta.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => convertToProject.mutate(proposalId)}
                      disabled={convertToProject.isPending}
                    >
                      {convertToProject.isPending ? "Criando..." : "Criar projeto"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
