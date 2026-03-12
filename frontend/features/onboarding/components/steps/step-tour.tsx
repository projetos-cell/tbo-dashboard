"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import type { RoleSlug } from "@/lib/permissions";

interface Module {
  icon: string;
  title: string;
  description: string;
}

const MODULES_BY_ROLE: Record<RoleSlug, Module[]> = {
  founder: [
    { icon: "📊", title: "Dashboard", description: "Visão executiva completa do negócio" },
    { icon: "💰", title: "Financeiro", description: "DRE, caixa e fluxo financeiro" },
    { icon: "🧠", title: "Intelligence", description: "Insights estratégicos e mercado" },
  ],
  diretoria: [
    { icon: "💰", title: "Financeiro", description: "DRE, caixa e pipeline comercial" },
    { icon: "🎯", title: "OKRs", description: "Defina e acompanhe metas da empresa" },
    { icon: "🧠", title: "Intelligence", description: "Insights e dados estratégicos" },
  ],
  lider: [
    { icon: "📋", title: "Projetos", description: "Crie, delegue e gerencie" },
    { icon: "👥", title: "Pessoas", description: "PDI, 1:1s e histórico do time" },
    { icon: "🎯", title: "OKRs", description: "Defina e acompanhe metas" },
  ],
  colaborador: [
    { icon: "✅", title: "Tarefas", description: "Suas tarefas e entregas" },
    { icon: "📋", title: "Projetos", description: "Projetos atribuídos a você" },
    { icon: "🎯", title: "OKRs", description: "Check-in nas suas metas" },
  ],
};

interface StepTourProps {
  onFinish: () => void;
  onBack: () => void;
  onSkip: () => void;
  isLoading: boolean;
}

export function StepTour({ onFinish, onBack, onSkip, isLoading }: StepTourProps) {
  const role = useAuthStore((s) => s.role);
  const modules = MODULES_BY_ROLE[role ?? "colaborador"];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">O que você pode fazer aqui</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Seus módulos principais estão prontos pra usar.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {modules.map((mod) => (
          <div
            key={mod.title}
            className="rounded-lg border bg-card p-4 flex flex-col gap-2 hover:bg-accent/50 transition-colors"
          >
            <span className="text-2xl">{mod.icon}</span>
            <p className="font-medium text-sm">{mod.title}</p>
            <p className="text-xs text-muted-foreground">{mod.description}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Explore o menu lateral para acessar todos os módulos disponíveis.
      </p>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={isLoading}>
          ← Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onSkip} disabled={isLoading}>
            Pular por agora
          </Button>
          <Button onClick={onFinish} disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar no TBO OS →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
