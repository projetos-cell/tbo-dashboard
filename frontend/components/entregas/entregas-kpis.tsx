"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Package, Eye, CheckCircle2, Clock } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type DeliverableRow = Database["public"]["Tables"]["deliverables"]["Row"];

interface EntregasKPIsProps {
  deliverables: DeliverableRow[];
}

export function EntregasKPIs({ deliverables }: EntregasKPIsProps) {
  const total = deliverables.length;
  const emRevisao = deliverables.filter((d) => d.status === "em_revisao").length;
  const aprovadas = deliverables.filter((d) => d.status === "aprovado").length;
  const pendentes = deliverables.filter((d) => d.status === "pendente").length;

  const items = [
    {
      label: "Total Entregas",
      value: total,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Em Revisão",
      value: emRevisao,
      icon: Eye,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Aprovadas",
      value: aprovadas,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Pendentes",
      value: pendentes,
      icon: Clock,
      color: "text-gray-600",
      bg: "bg-gray-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map(({ label, value, icon: Icon, color, bg }) => (
        <Card key={label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`rounded-lg p-2 ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
