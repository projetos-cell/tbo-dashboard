"use client";

import {
  IconRocket,
  IconLayoutSidebar,
  IconSearch,
  IconBell,
  IconFolderPlus,
  IconLifebuoy,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const TOUR_PREVIEW = [
  {
    icon: IconLayoutSidebar,
    title: "Menu de navegacao",
    description: "Conheça todos os modulos disponiveis",
  },
  {
    icon: IconSearch,
    title: "Busca rapida (Ctrl+K)",
    description: "Encontre qualquer coisa no sistema",
  },
  {
    icon: IconFolderPlus,
    title: "Criar seu primeiro projeto",
    description: "Vamos te guiar nessa primeira acao",
  },
  {
    icon: IconBell,
    title: "Notificacoes",
    description: "Saiba onde ficam seus alertas",
  },
  {
    icon: IconLifebuoy,
    title: "Ajuda e suporte",
    description: "Onde buscar ajuda quando precisar",
  },
];

interface StepTourProps {
  onFinish: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export function StepTour({ onFinish, onBack, isLoading }: StepTourProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <IconRocket className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Tudo pronto!</h2>
          <p className="text-muted-foreground text-sm">
            Seu perfil foi configurado com sucesso.
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-3">
          Agora vamos fazer um tour rapido pela plataforma. Voce vai conhecer:
        </p>
        <div className="space-y-2">
          {TOUR_PREVIEW.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={isLoading}
        >
          Voltar
        </Button>
        <Button onClick={onFinish} disabled={isLoading} size="lg">
          {isLoading ? "Preparando..." : "Iniciar tour"}
        </Button>
      </div>
    </div>
  );
}
