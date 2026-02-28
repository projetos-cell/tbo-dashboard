"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Building2, UserPlus, Star, Users } from "lucide-react";
import type { ClientKPIs } from "@/services/clients";

interface ClientKPICardsProps {
  kpis: ClientKPIs;
}

const cards = [
  { key: "total" as const, label: "Total", icon: Building2, color: "#6b7280" },
  { key: "ativos" as const, label: "Ativos", icon: Users, color: "#22c55e" },
  { key: "leads" as const, label: "Leads", icon: UserPlus, color: "#8b5cf6" },
  { key: "vip" as const, label: "VIP", icon: Star, color: "#f59e0b" },
];

export function ClientKPICards({ kpis }: ClientKPICardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.key}>
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${c.color}18` }}
              >
                <Icon className="h-5 w-5" style={{ color: c.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpis[c.key]}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
