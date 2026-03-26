"use client";

import { useEffect, useCallback } from "react";
import { useJoyride, STATUS, type Step, type EventData, type PartialDeep, type Styles } from "react-joyride";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

const TOUR_KEY = "onboarding_main";

const TOUR_STEPS: Step[] = [
  {
    target: "[data-tour='sidebar']",
    content:
      "Este e o menu principal. Aqui voce acessa todos os modulos — projetos, tarefas, financeiro, comercial e mais. Voce pode arrastar para reorganizar.",
    title: "Menu de navegacao",
    placement: "right",
    skipBeacon: true,
  },
  {
    target: "[data-tour='pinned-items']",
    content:
      "Esses sao seus atalhos fixos — Dashboard, Tarefas, Chat e Projetos. Sempre visiveis, acesso rapido.",
    title: "Atalhos principais",
    placement: "right",
    skipBeacon: true,
  },
  {
    target: "[data-tour='search-btn']",
    content:
      "Use Ctrl+K (ou Cmd+K) para buscar qualquer coisa no sistema — projetos, tarefas, pessoas, configuracoes.",
    title: "Busca rapida",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='notifications']",
    content:
      "Aqui aparecem suas notificacoes — mencoes, tarefas atribuidas, atualizacoes de projetos e mais.",
    title: "Notificacoes",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='user-avatar']",
    content:
      "Clique no seu avatar para acessar configuracoes da conta, preferencias e sair do sistema.",
    title: "Sua conta",
    placement: "bottom-end",
    skipBeacon: true,
  },
  {
    target: "[data-tour='nav-projetos']",
    content:
      "Comece por aqui! Crie seu primeiro projeto ou explore os que ja existem. Essa e sua area principal de trabalho.",
    title: "Projetos — sua acao principal",
    placement: "right",
    skipBeacon: true,
  },
];

const JOYRIDE_STYLES: PartialDeep<Styles> = {
  tooltip: {
    borderRadius: "12px",
    padding: "20px",
    fontSize: "14px",
  },
  tooltipTitle: {
    fontSize: "16px",
    fontWeight: 600,
    marginBottom: "8px",
  },
  tooltipContent: {
    padding: "8px 0 0",
    lineHeight: "1.6",
  },
  buttonPrimary: {
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: 500,
  },
  buttonBack: {
    color: "#71717a",
    fontSize: "13px",
    fontWeight: 500,
  },
  buttonSkip: {
    color: "#a1a1aa",
    fontSize: "12px",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
};

const LOCALE = {
  back: "Voltar",
  close: "Fechar",
  last: "Concluir",
  next: "Proximo",
  open: "Abrir",
  skip: "Pular tour",
};

interface ProductTourProps {
  run: boolean;
  onComplete: () => void;
}

export function ProductTour({ run, onComplete }: ProductTourProps) {
  const userId = useAuthStore((s) => s.user?.id);

  const handleEvent = useCallback(
    async (data: EventData) => {
      if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
        // Persist tour completion
        if (userId) {
          const supabase = createClient();
          const { data: profile } = await supabase
            .from("profiles")
            .select("module_tours_completed")
            .eq("id", userId)
            .single();

          const current =
            (profile?.module_tours_completed as Record<string, boolean>) ?? {};
          await supabase
            .from("profiles")
            .update({
              module_tours_completed: { ...current, [TOUR_KEY]: true },
              updated_at: new Date().toISOString(),
            } as never)
            .eq("id", userId);
        }

        onComplete();
      }
    },
    [userId, onComplete],
  );

  const { Tour, controls } = useJoyride({
    steps: TOUR_STEPS,
    continuous: true,
    scrollToFirstStep: true,
    onEvent: handleEvent,
    styles: JOYRIDE_STYLES,
    locale: LOCALE,
    options: {
      primaryColor: "#e85102",
      zIndex: 10000,
      spotlightRadius: 8,
      showProgress: true,
      buttons: ["back", "primary", "skip"],
    },
  });

  // Start the tour when `run` becomes true
  useEffect(() => {
    if (run) {
      const timer = setTimeout(() => controls.start(), 600);
      return () => clearTimeout(timer);
    }
  }, [run, controls]);

  return Tour;
}
