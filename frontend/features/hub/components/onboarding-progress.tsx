"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  IconCheck,
  IconCircle,
  IconRocket,
  IconUsers,
  IconBook,
  IconTarget,
  IconMessageCircle,
  IconBriefcase,
  IconCalendar,
  IconSettings,
  IconHeart,
} from "@tabler/icons-react";
import {
  useOnboardingChecklist,
  useToggleChecklistTask,
} from "@/features/onboarding/hooks/use-onboarding";
import type { ChecklistProgress } from "@/features/onboarding/services/onboarding";

/* ─── Design Tokens ──────────────────────────────────────── */

const T = {
  text: "#0f0f0f",
  muted: "#4a4a4a",
  orange: "#c45a1a",
  green: "#10b981",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  glass: "rgba(255,255,255,0.65)",
  glassBorder: "rgba(255,255,255,0.45)",
  glassShadow:
    "0 8px 32px rgba(15,15,15,0.06), 0 1px 3px rgba(15,15,15,0.04)",
  glassBlur: "blur(16px) saturate(180%)",
  r: "16px",
};

/* ─── D1/D7/D30 Task Definitions ─────────────────────────── */

interface OnboardingTask {
  id: string;
  label: string;
  description: string;
  icon: typeof IconCheck;
  phase: "d1" | "d7" | "d30";
}

const PHASES = [
  { key: "d1" as const, label: "Dia 1", subtitle: "Primeiros passos", color: T.blue },
  { key: "d7" as const, label: "Dia 7", subtitle: "Conectar & explorar", color: T.orange },
  { key: "d30" as const, label: "Dia 30", subtitle: "Dominar & contribuir", color: T.purple },
];

const ONBOARDING_TASKS: OnboardingTask[] = [
  // D1 — Primeiros passos
  {
    id: "d1_profile",
    label: "Completar perfil",
    description: "Foto, cargo, departamento",
    icon: IconSettings,
    phase: "d1",
  },
  {
    id: "d1_team",
    label: "Conhecer o time",
    description: "Ver organograma em Pessoas",
    icon: IconUsers,
    phase: "d1",
  },
  {
    id: "d1_chat",
    label: "Enviar primeira mensagem",
    description: "Dizer oi no chat geral",
    icon: IconMessageCircle,
    phase: "d1",
  },
  {
    id: "d1_calendar",
    label: "Configurar agenda",
    description: "Conectar Google Calendar",
    icon: IconCalendar,
    phase: "d1",
  },
  // D7 — Conectar & explorar
  {
    id: "d7_project",
    label: "Criar ou participar de um projeto",
    description: "Acessar Projetos e se envolver",
    icon: IconBriefcase,
    phase: "d7",
  },
  {
    id: "d7_wiki",
    label: "Ler 3 artigos do Conhecimento",
    description: "Explorar a base de conhecimento",
    icon: IconBook,
    phase: "d7",
  },
  {
    id: "d7_okr",
    label: "Conhecer os OKRs da empresa",
    description: "Navegar pelos objetivos atuais",
    icon: IconTarget,
    phase: "d7",
  },
  // D30 — Dominar & contribuir
  {
    id: "d30_post",
    label: "Publicar no feed",
    description: "Compartilhar algo com o time",
    icon: IconHeart,
    phase: "d30",
  },
  {
    id: "d30_wiki_contrib",
    label: "Contribuir para o Conhecimento",
    description: "Criar ou melhorar um artigo",
    icon: IconBook,
    phase: "d30",
  },
  {
    id: "d30_complete",
    label: "Marcar onboarding como completo",
    description: "Voce esta em casa!",
    icon: IconRocket,
    phase: "d30",
  },
];

/* ─── Component ──────────────────────────────────────────── */

export function OnboardingProgressWidget() {
  const { data: checklist = {}, isLoading } = useOnboardingChecklist();
  const toggleTask = useToggleChecklistTask();

  const stats = useMemo(() => {
    const total = ONBOARDING_TASKS.length;
    const completed = ONBOARDING_TASKS.filter(
      (t) => checklist[t.id]?.completed,
    ).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [checklist]);

  // Get current phase
  const currentPhase = useMemo(() => {
    for (const phase of PHASES) {
      const tasks = ONBOARDING_TASKS.filter((t) => t.phase === phase.key);
      const allDone = tasks.every((t) => checklist[t.id]?.completed);
      if (!allDone) return phase.key;
    }
    return "d30";
  }, [checklist]);

  function handleToggle(taskId: string) {
    toggleTask.mutate({ taskId, currentChecklist: checklist as ChecklistProgress });
  }

  // Don't show if all completed
  if (!isLoading && stats.percent === 100) return null;

  if (isLoading) {
    return (
      <div
        className="p-5 animate-pulse"
        style={{
          background: T.glass,
          backdropFilter: T.glassBlur,
          WebkitBackdropFilter: T.glassBlur,
          border: `1px solid ${T.glassBorder}`,
          borderRadius: T.r,
        }}
      >
        <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
        <div className="h-2 w-full bg-gray-200 rounded mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden"
      style={{
        background: T.glass,
        backdropFilter: T.glassBlur,
        WebkitBackdropFilter: T.glassBlur,
        border: `1px solid ${T.glassBorder}`,
        borderRadius: T.r,
        boxShadow: T.glassShadow,
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4"
        style={{
          background: "linear-gradient(135deg, #1a1410 0%, #2d1810 50%, #c45a1a 100%)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <IconRocket className="size-5 text-white" />
          <div>
            <h3 className="text-sm font-semibold text-white">
              Onboarding
            </h3>
            <p className="text-[11px] text-white/50">
              {stats.completed}/{stats.total} tarefas completas
            </p>
          </div>
          <span
            className="ml-auto text-sm font-bold"
            style={{ color: T.orange }}
          >
            {stats.percent}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: T.orange }}
            initial={{ width: 0 }}
            animate={{ width: `${stats.percent}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Phase stepper */}
      <div className="px-5 py-3 flex items-center gap-1 border-b" style={{ borderColor: "rgba(15,15,15,0.06)" }}>
        {PHASES.map((phase, idx) => {
          const tasks = ONBOARDING_TASKS.filter(
            (t) => t.phase === phase.key,
          );
          const done = tasks.filter(
            (t) => checklist[t.id]?.completed,
          ).length;
          const allDone = done === tasks.length;
          const isCurrent = phase.key === currentPhase;

          return (
            <div key={phase.key} className="flex items-center gap-1 flex-1">
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg flex-1 transition-all"
                style={{
                  background: isCurrent
                    ? `${phase.color}10`
                    : "transparent",
                  border: isCurrent
                    ? `1px solid ${phase.color}25`
                    : "1px solid transparent",
                }}
              >
                {allDone ? (
                  <div
                    className="size-4 rounded-full flex items-center justify-center"
                    style={{ background: T.green }}
                  >
                    <IconCheck className="size-2.5 text-white" />
                  </div>
                ) : (
                  <div
                    className="size-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                    style={{
                      background: isCurrent
                        ? `${phase.color}15`
                        : "rgba(15,15,15,0.05)",
                      color: isCurrent ? phase.color : T.muted,
                    }}
                  >
                    {done}/{tasks.length}
                  </div>
                )}
                <div>
                  <p
                    className="text-[10px] font-semibold leading-none"
                    style={{
                      color: isCurrent ? phase.color : allDone ? T.green : T.muted,
                    }}
                  >
                    {phase.label}
                  </p>
                  <p className="text-[9px] leading-none mt-0.5" style={{ color: T.muted }}>
                    {phase.subtitle}
                  </p>
                </div>
              </div>
              {idx < PHASES.length - 1 && (
                <div
                  className="w-3 h-px shrink-0"
                  style={{
                    background: allDone ? T.green : "rgba(15,15,15,0.1)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Tasks for current phase */}
      <div className="px-5 py-3">
        {PHASES.filter((p) => p.key === currentPhase).map((phase) => {
          const tasks = ONBOARDING_TASKS.filter(
            (t) => t.phase === phase.key,
          );
          return (
            <div key={phase.key} className="space-y-1.5">
              {tasks.map((task) => {
                const done = checklist[task.id]?.completed;
                const Icon = task.icon;
                return (
                  <button
                    key={task.id}
                    onClick={() => handleToggle(task.id)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all hover:bg-black/[0.03] active:scale-[0.99] text-left"
                  >
                    {done ? (
                      <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="size-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: T.green }}
                      >
                        <IconCheck className="size-3 text-white" />
                      </motion.div>
                    ) : (
                      <div
                        className="size-5 rounded-full flex items-center justify-center shrink-0 border"
                        style={{
                          borderColor: "rgba(15,15,15,0.15)",
                          background: "rgba(15,15,15,0.02)",
                        }}
                      >
                        <IconCircle className="size-2.5" style={{ color: T.muted, opacity: 0.4 }} />
                      </div>
                    )}

                    <Icon
                      className="size-4 shrink-0"
                      style={{ color: done ? T.green : phase.color, opacity: done ? 0.5 : 1 }}
                    />

                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-medium leading-snug"
                        style={{
                          color: done ? T.muted : T.text,
                          textDecoration: done ? "line-through" : "none",
                          opacity: done ? 0.6 : 1,
                        }}
                      >
                        {task.label}
                      </p>
                      <p
                        className="text-[10px] leading-snug"
                        style={{ color: T.muted, opacity: done ? 0.4 : 0.7 }}
                      >
                        {task.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
