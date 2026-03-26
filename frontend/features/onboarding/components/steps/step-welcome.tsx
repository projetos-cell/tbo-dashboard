"use client";

import {
  IconCircleCheck,
  IconBrandOpenSource,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import type { RoleSlug } from "@/lib/permissions";

const ROLE_CONTENT: Record<RoleSlug, { label: string; can: string[] }> = {
  founder: {
    label: "Fundador",
    can: [
      "Acesso total ao sistema",
      "Gestao financeira completa",
      "Configurar RBAC e permissoes",
      "Todos os modulos e relatorios",
    ],
  },
  diretoria: {
    label: "Diretoria",
    can: [
      "Gestao financeira (DRE, Caixa)",
      "Pipeline comercial",
      "OKRs e projetos",
      "Intelligence completo",
    ],
  },
  lider: {
    label: "Lider",
    can: [
      "Criar e gerenciar projetos",
      "Conduzir 1:1s com seu time",
      "Acompanhar OKRs",
      "PDI e Recompensas do time",
    ],
  },
  colaborador: {
    label: "Colaborador",
    can: [
      "Ver e executar tarefas",
      "Participar de 1:1s",
      "Check-in em OKRs proprios",
      "Reconhecimentos",
    ],
  },
};

interface StepWelcomeProps {
  onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  const role = useAuthStore((s) => s.role);
  const user = useAuthStore((s) => s.user);

  const firstName =
    (user?.user_metadata as Record<string, unknown>)?.full_name
      ?.toString()
      .split(" ")[0] ?? "voce";
  const content = ROLE_CONTENT[role ?? "colaborador"];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <IconBrandOpenSource className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Bem-vindo ao</p>
          <h2 className="text-xl font-semibold tracking-tight">TBO OS</h2>
        </div>
      </div>

      <div>
        <p className="text-lg font-medium">
          Ola, {firstName}!
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          O TBO OS e o sistema operacional da agencia — onde voce gerencia projetos,
          tarefas, financeiro, pessoas e tudo que move o negocio. Voce entrou
          como{" "}
          <span className="font-medium text-foreground">{content.label}</span>.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          O que voce pode fazer
        </p>
        <ul className="space-y-2.5">
          {content.can.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm">
              <IconCircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-muted-foreground">
        Vamos configurar seu perfil em menos de 2 minutos.
      </p>

      <div className="flex justify-end pt-2">
        <Button onClick={onNext} size="lg">
          Comecar
        </Button>
      </div>
    </div>
  );
}
