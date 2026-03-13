"use client";

import { IconCircleCheck, IconLock } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import type { RoleSlug } from "@/lib/permissions";

const ROLE_CONTENT: Record<
  RoleSlug,
  { label: string; can: string[]; cant: string[] }
> = {
  founder: {
    label: "Fundador",
    can: ["Acesso total ao sistema", "Gestão financeira completa", "Configurar RBAC e permissões", "Todos os módulos e relatórios"],
    cant: [],
  },
  diretoria: {
    label: "Diretoria",
    can: ["Gestão financeira (DRE, Caixa)", "Pipeline comercial", "OKRs e projetos", "Intelligence completo"],
    cant: ["Gerenciar permissões de usuários"],
  },
  lider: {
    label: "Líder",
    can: ["Criar e gerenciar projetos", "Conduzir 1:1s com seu time", "Acompanhar OKRs", "PDI e Recompensas do time"],
    cant: ["Financeiro e DRE", "Gestão de permissões"],
  },
  colaborador: {
    label: "Colaborador",
    can: ["Ver e executar tarefas", "Participar de 1:1s", "Check-in em OKRs próprios", "Reconhecimentos"],
    cant: ["Financeiro", "Intelligence", "Criar projetos"],
  },
};

interface StepWelcomeProps {
  onNext: () => void;
  onSkip: () => void;
}

export function StepWelcome({ onNext, onSkip }: StepWelcomeProps) {
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

      <div className="grid gap-4 sm:grid-cols-2">
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

        {content.cant.length > 0 && (
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Restrições do seu role
            </p>
            <ul className="space-y-2">
              {content.cant.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <IconLock className="mt-0.5 h-4 w-4 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Isso leva menos de 2 minutos.
      </p>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={onSkip}>
          Pular por agora
        </Button>
        <Button onClick={onNext}>Começar →</Button>
      </div>
    </div>
  );
}
