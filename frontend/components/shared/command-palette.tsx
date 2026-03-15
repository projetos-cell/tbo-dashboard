"use client";

import { useMemo } from "react";
import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  KBarResults,
  useMatches,
  type ActionImpl,
  type Action,
} from "kbar";
import { useRouter } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";

// ─── Results renderer ──────────────────────────────────────────────────────────

function RenderResults() {
  const { results } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div className="px-3 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {item}
          </div>
        ) : (
          <ResultItem action={item} active={active} />
        )
      }
    />
  );
}

function ResultItem({
  action,
  active,
}: {
  action: ActionImpl;
  active: boolean;
}) {
  return (
    <div
      className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
        active ? "bg-accent text-accent-foreground" : "text-foreground"
      }`}
    >
      {action.icon && (
        <span className="flex size-5 items-center justify-center text-muted-foreground">
          {action.icon}
        </span>
      )}
      <div className="flex flex-1 flex-col">
        <span>{action.name}</span>
        {action.subtitle && (
          <span className="text-xs text-muted-foreground">
            {action.subtitle}
          </span>
        )}
      </div>
      {action.shortcut?.length ? (
        <div className="flex items-center gap-1">
          {action.shortcut.map((sc) => (
            <kbd
              key={sc}
              className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {sc}
            </kbd>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function CommandPalette({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const actions: Action[] = useMemo(() => {
    const navActions: Action[] = NAV_ITEMS.map((item) => ({
      id: `nav-${item.module}`,
      name: item.label,
      section: "Navegação",
      perform: () => router.push(item.href),
      keywords: item.module,
    }));

    const quickActions: Action[] = [
      {
        id: "create-project",
        name: "Criar projeto",
        section: "Ações rápidas",
        shortcut: ["c"],
        perform: () => router.push("/projetos?new=1"),
        keywords: "novo projeto criar",
      },
      {
        id: "go-list",
        name: "Ir para Lista",
        section: "Navegação Projetos",
        shortcut: ["g", "l"],
        keywords: "lista projetos",
        perform: () => router.push("/projetos/lista"),
      },
      {
        id: "go-gantt",
        name: "Ir para Gantt",
        section: "Navegação Projetos",
        shortcut: ["g", "g"],
        keywords: "gantt timeline",
        perform: () => router.push("/projetos/timeline"),
      },
      {
        id: "go-calendar",
        name: "Ir para Calendário",
        section: "Navegação Projetos",
        shortcut: ["g", "c"],
        keywords: "calendário agenda",
        perform: () => router.push("/projetos/calendario"),
      },
      {
        id: "go-portfolio",
        name: "Ir para Portfolio",
        section: "Navegação Projetos",
        shortcut: ["g", "p"],
        keywords: "portfolio visão geral",
        perform: () => router.push("/projetos/portfolio"),
      },
      {
        id: "go-workload",
        name: "Ir para Workload",
        section: "Navegação Projetos",
        shortcut: ["g", "w"],
        keywords: "workload carga trabalho",
        perform: () => router.push("/projetos/workload"),
      },
      {
        id: "go-templates",
        name: "Ir para Templates",
        section: "Navegação Projetos",
        shortcut: ["g", "t"],
        keywords: "templates modelos",
        perform: () => router.push("/projetos/templates"),
      },
      {
        id: "go-my-tasks",
        name: "Minhas Tarefas",
        section: "Ações rápidas",
        shortcut: ["g", "m"],
        keywords: "minhas tarefas tasks",
        perform: () => router.push("/tarefas"),
      },
      {
        id: "advanced-search",
        name: "Busca avançada de tarefas",
        section: "Ações rápidas",
        keywords: "buscar filtrar pesquisar search",
        perform: () => {
          window.dispatchEvent(new CustomEvent("open-task-search"));
        },
      },
    ];

    return [...navActions, ...quickActions];
  }, [router]);

  return (
    <KBarProvider actions={actions}>
      {children}
      <KBarPortal>
        <KBarPositioner className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm">
          <KBarAnimator className="mx-auto w-full max-w-[520px] overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
            <KBarSearch
              className="w-full border-b border-border bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
              defaultPlaceholder="Buscar comandos, páginas..."
            />
            <div className="max-h-[360px] overflow-y-auto pb-2">
              <RenderResults />
            </div>
            <div className="flex items-center justify-between border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground">
              <span>↑↓ navegar</span>
              <span>↵ selecionar</span>
              <span>esc fechar</span>
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
    </KBarProvider>
  );
}
