"use client";

import { IconCircleCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import type { RoleSlug } from "@/lib/permissions";

const ROLE_CONTENT: Record<RoleSlug, { label: string; can: string[] }> = {
  founder: {
    label: "Fundador",
    can: ["Acesso total ao sistema", "Gestão financeira completa", "Configurar RBAC e permissões", "Todos os módulos e relatórios"],
  },
  diretoria: {
    label: "Diretoria",
    can: ["Gestão financeira (DRE, Caixa)", "Pipeline comercial", "OKRs e projetos", "Intelligence completo"],
  },
  lider: {
    label: "Líder",
    can: ["Criar e gerenciar projetos", "Conduzir 1:1s com seu time", "Acompanhar OKRs", "PDI e Recompensas do time"],
  },
  colaborador: {
    label: "Colaborador",
    can: ["Ver e executar tarefas", "Participar de 1:1s", "Check-in em OKRs próprios", "Reconhecimentos"],
  },
};

interface StepWelcomeProps {
  onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  const role = useAuthStore((s) => s.role);
  const user = useAuthStore((s) => s.user);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? "você";
  const content = ROLE_CONTENT[role ?? "colaborador"];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-muted-foreground text-sm mb-1">Bem-vindo ao TBO OS</p>
        <h2 className="text-2xl font-semibold tracking-tight">
          Olá, {firstName} 👋
        </h2>
        <p className="text-muted-foreground mt-1">
          Você entrou como{" "}
          <span className="font-medium text-foreground">{content.label}</span>.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          O que você pode fazer
        </p>
        <ul className="space-y-2">
          {content.can.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm">
              <IconCircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-muted-foreground">
        Isso leva menos de 2 minutos.
      </p>

      <div className="flex justify-end pt-2">
        <Button onClick={onNext}>Começar →</Button>
      </div>
    </div>
  );
}
