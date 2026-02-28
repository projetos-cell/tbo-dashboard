"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { MeetingKPIs } from "@/services/meetings";
import { Video, CalendarDays, FileText, Clock } from "lucide-react";

export function MeetingKPICards({ kpis }: { kpis: MeetingKPIs }) {
  const items = [
    {
      label: "Total Reunioes",
      value: kpis.total,
      icon: Video,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Esta Semana",
      value: kpis.thisWeek,
      icon: CalendarDays,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Com Transcricao",
      value: kpis.withTranscription,
      icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Media Duracao",
      value: kpis.avgDuration > 0 ? `${kpis.avgDuration} min` : "\u2014",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
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
