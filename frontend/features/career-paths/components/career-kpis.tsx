"use client";

import { Users, TrendingUp, Star, GitBranch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CareerPathWithMemberCount } from "@/features/career-paths/services/career-paths";

interface CareerKPIsProps {
  paths: CareerPathWithMemberCount[];
  isLoading?: boolean;
}

export function CareerKPIs({ paths, isLoading }: CareerKPIsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
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

  const kpis = [
    {
      icon: <Users className="h-4 w-4 text-blue-500" />,
      label: "Total na trilha",
      value: totalMembers,
      sub: "membros com nível definido",
    },
    {
      icon: <GitBranch className="h-4 w-4 text-purple-500" />,
      label: "Núcleos ativos",
      value: `${nucleosComMembros}/${nucleosTotal}`,
      sub: "com membros cadastrados",
    },
    {
      icon: <Star className="h-4 w-4 text-orange-500" />,
      label: "Maior núcleo",
      value: maiorNucleo.name,
      sub: `${maiorNucleo.count} membros`,
    },
    {
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
      label: "Dual-track",
      value: "Gestão + Técnica",
      sub: "por núcleo",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {kpis.map((kpi, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {kpi.icon}
              <span className="text-xs text-muted-foreground font-medium">{kpi.label}</span>
            </div>
            <p className="text-xl font-bold leading-tight">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
