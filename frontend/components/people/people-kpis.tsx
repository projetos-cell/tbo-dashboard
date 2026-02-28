"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { PeopleKPIs } from "@/services/people";
import { Users, UserCheck, Palmtree, Building2 } from "lucide-react";

export function PeopleKPICards({ kpis }: { kpis: PeopleKPIs }) {
  const buCount = Object.keys(kpis.byBU).length;

  const items = [
    { label: "Total", value: kpis.total, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Ativos", value: kpis.active, icon: UserCheck, color: "text-green-600", bg: "bg-green-50" },
    { label: "Férias", value: kpis.onVacation, icon: Palmtree, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "BUs", value: buCount, icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
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
