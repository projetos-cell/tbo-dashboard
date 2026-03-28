"use client";

import { motion } from "framer-motion";
import { Users, TrendingUp, Star, GitBranch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CareerPathWithMemberCount } from "@/features/career-paths/services/career-paths";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" as const } },
};

interface CareerKPIsProps {
  paths: CareerPathWithMemberCount[];
  isLoading?: boolean;
}

export function CareerKPIs({ paths, isLoading }: CareerKPIsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    );
  }

  const totalMembers = paths.reduce((s, p) => s + p.member_count, 0);
  const nucleosComMembros = paths.filter((p) => p.member_count > 0).length;
  const nucleosTotal = paths.length;
  const maiorNucleo = paths.reduce(
    (max, p) => (p.member_count > max.count ? { name: p.name, count: p.member_count } : max),
    { name: "—", count: 0 }
  );
  const totalComNivel = totalMembers;
  const totalProfiles = paths.length > 0 ? paths.reduce((s, p) => s + p.member_count, 0) : 0;

  const kpis = [
    {
      key: "total",
      icon: <Users className="h-4 w-4 text-blue-500" />,
      label: "Total na trilha",
      value: totalMembers,
      sub: "membros com nível definido",
    },
    {
      key: "nucleos",
      icon: <GitBranch className="h-4 w-4 text-purple-500" />,
      label: "Núcleos ativos",
      value: `${nucleosComMembros}/${nucleosTotal}`,
      sub: "com membros cadastrados",
    },
    {
      key: "maior",
      icon: <Star className="h-4 w-4 text-orange-500" />,
      label: "Maior núcleo",
      value: maiorNucleo.name,
      sub: `${maiorNucleo.count} membros`,
    },
    {
      key: "dualtrack",
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
      label: "Dual-track",
      value: "Gestão + Técnica",
      sub: "por núcleo",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {kpis.map((kpi) => (
        <motion.div key={kpi.key} variants={item}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {kpi.icon}
                <span className="text-xs text-muted-foreground font-medium">{kpi.label}</span>
              </div>
              <p className="text-xl font-bold leading-tight">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
