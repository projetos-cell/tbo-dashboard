"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import type { PeopleKPIsV2 } from "@/features/people/services/people";
import {
  IconUsers,
  IconUserCheck,
  IconUserPlus,
  IconAlertTriangle,
  IconMessage,
  IconTarget,
  IconAward,
  IconFlame,
} from "@tabler/icons-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PeopleKPIKey =
  | "total"
  | "active"
  | "onboarding"
  | "at_risk"
  | "pending_1on1"
  | "stale_pdi"
  | "month_recognitions"
  | "overloaded";

interface Props {
  kpis: PeopleKPIsV2;
  activeKPI: PeopleKPIKey | null;
  onKPIClick: (key: PeopleKPIKey) => void;
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Config: 8 KPIs — label, tooltip, icon, colors
// ---------------------------------------------------------------------------

const KPI_KEYS: PeopleKPIKey[] = [
  "total",
  "active",
  "onboarding",
  "at_risk",
  "pending_1on1",
  "stale_pdi",
  "month_recognitions",
  "overloaded",
];

const KPI_CONFIG: Record<
  PeopleKPIKey,
  {
    label: string;
    tooltip: string;
    icon: React.ElementType;
    color: string;
    bg: string;
  }
> = {
  total: {
    label: "Total",
    tooltip: "Número total de colaboradores cadastrados",
    icon: IconUsers,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  active: {
    label: "Ativos",
    tooltip: "Colaboradores com status Ativo",
    icon: IconUserCheck,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/40",
  },
  onboarding: {
    label: "Em onboarding",
    tooltip: "Colaboradores em processo de integração",
    icon: IconUserPlus,
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950/40",
  },
  at_risk: {
    label: "Em risco",
    tooltip: "Ativos com avaliação < 60 ou PDI atrasado",
    icon: IconAlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/40",
  },
  pending_1on1: {
    label: "1:1 pendentes",
    tooltip: "Ativos sem 1:1 concluído nos últimos 30 dias",
    icon: IconMessage,
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950/40",
  },
  stale_pdi: {
    label: "PDIs desatualizados",
    tooltip: "Ativos sem atualização de PDI nos últimos 90 dias",
    icon: IconTarget,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  month_recognitions: {
    label: "Reconhecimentos",
    tooltip: "Total de reconhecimentos dados neste mês",
    icon: IconAward,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  overloaded: {
    label: "Overload",
    tooltip: "Ativos com 8 ou mais tarefas abertas",
    icon: IconFlame,
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-950/40",
  },
};

// ---------------------------------------------------------------------------
// Motion variants
// ---------------------------------------------------------------------------

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PeopleKPICardsV2({
  kpis,
  activeKPI,
  onKPIClick,
  isLoading,
}: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-[72px] animate-pulse rounded-lg border bg-gray-100/40"
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={gridVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-4 md:grid-cols-4"
    >
      {KPI_KEYS.map((key) => {
        const cfg = KPI_CONFIG[key];
        const Icon = cfg.icon;
        const value = kpis[key];
        const isActive = activeKPI === key;

        return (
          <motion.div key={key} variants={cardVariants}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isActive ? "ring-2 ring-tbo-orange" : ""
                  }`}
                  onClick={() => onKPIClick(key)}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className={`rounded-lg p-2 ${cfg.bg}`}>
                      <Icon className={`h-5 w-5 ${cfg.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold">{value}</p>
                      <p className="truncate text-xs text-gray-500">
                        {cfg.label}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom">{cfg.tooltip}</TooltipContent>
            </Tooltip>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
