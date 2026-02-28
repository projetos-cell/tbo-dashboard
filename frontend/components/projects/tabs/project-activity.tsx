"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { useProjectActivity } from "@/hooks/use-activity";

interface ProjectActivityTabProps {
  projectId: string;
}

const ENTITY_FILTERS = [
  { key: "all", label: "Todos" },
  { key: "task", label: "Tarefas" },
  { key: "comment", label: "Comentarios" },
  { key: "attachment", label: "Anexos" },
  { key: "section", label: "Secoes" },
] as const;

export function ProjectActivityTab({ projectId }: ProjectActivityTabProps) {
  const [limit, setLimit] = useState(50);
  const [filter, setFilter] = useState<string>("all");
  const { data: activities, isLoading } = useProjectActivity(projectId, limit);

  const filtered =
    filter === "all"
      ? activities || []
      : (activities || []).filter((a) => a.entity_type === filter);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium">
          Historico de atividades
        </CardTitle>
        <div className="flex gap-1">
          {ENTITY_FILTERS.map((f) => (
            <Badge
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ActivityFeed
          activities={filtered}
          isLoading={isLoading}
          emptyMessage="Nenhuma atividade registrada"
        />
        {filtered.length >= limit && (
          <div className="text-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLimit((l) => l + 50)}
            >
              Carregar mais
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
