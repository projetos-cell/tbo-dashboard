"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  Video,
  Users,
  Megaphone,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";
import {
  fmtNum,
  type RsmMetricRow,
  type RsmAccountRow,
  type RsmPostRow,
} from "./rsm-helpers";

interface Props {
  account: RsmAccountRow;
  metrics: RsmMetricRow[];
  posts: RsmPostRow[];
}

interface Action {
  icon: LucideIcon;
  title: string;
  description: string;
  priority: "alta" | "média" | "baixa";
}

export function RsmRecommendedActions({ account, metrics, posts }: Props) {
  const actions = useMemo(
    () => generateActions(account, metrics, posts),
    [account, metrics, posts]
  );

  if (actions.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Ações Recomendadas</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {actions.map((action, i) => (
          <ActionCard key={i} action={action} />
        ))}
      </div>
    </div>
  );
}

function ActionCard({ action }: { action: Action }) {
  const Icon = action.icon;
  const priorityStyles: Record<string, string> = {
    alta: "bg-red-500/10 text-red-600 dark:text-red-400",
    média: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    baixa: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  };

  return (
    <Card className="group hover:border-primary/30 transition-colors">
      <CardContent className="pt-5">
        <div className="flex gap-3">
          <div className="shrink-0 mt-0.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold">{action.title}</span>
              <Badge variant="secondary" className={`text-[10px] ${priorityStyles[action.priority]}`}>
                {action.priority}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {action.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function generateActions(
  account: RsmAccountRow,
  metrics: RsmMetricRow[],
  posts: RsmPostRow[]
): Action[] {
  const actions: Action[] = [];
  const latestMetric = metrics[metrics.length - 1];
  const firstMetric = metrics[0];
  const meta = (latestMetric?.metadata ?? {}) as Record<string, unknown>;
  const followers = account?.followers_count ?? 0;
  const firstFollowers = firstMetric?.followers ?? 0;

  const formats = (meta.formats as Record<string, Record<string, unknown>>) ?? {};
  const reels = formats.reels ?? {};
  const feed = formats.feed ?? {};
  const stories = formats.stories ?? {};

  const paid = (meta.reach_paid as number) ?? 0;
  const organic = (meta.reach_organic as number) ?? 0;
  const total = paid + organic;

  // Stories zerados
  if ((stories.reach_30d as number) === 0) {
    actions.push({
      icon: CalendarCheck,
      title: "Reativar Stories",
      description:
        "Alcance de Stories zerado nos últimos 30 dias. Publicar pelo menos 3-5 stories/semana para manter presença e engajamento no topo do feed.",
      priority: "alta",
    });
  }

  // Dependência de mídia paga
  if (total > 0 && (paid / total) > 0.9) {
    actions.push({
      icon: Megaphone,
      title: "Fortalecer orgânico",
      description: `${((paid / total) * 100).toFixed(0)}% do alcance vem de ads. Criar conteúdo nativo com hooks fortes, usar hashtags estratégicas e incentivar compartilhamentos para reduzir dependência de mídia paga.`,
      priority: "alta",
    });
  }

  // Reels com alta performance
  const reelsInteractions = (reels.interactions as number) ?? 0;
  const feedInteractions = (feed.interactions as number) ?? 0;
  if (reelsInteractions > feedInteractions * 1.5 && reelsInteractions > 0) {
    actions.push({
      icon: Video,
      title: "Aumentar frequência de Reels",
      description: `Reels geram ${fmtNum(reelsInteractions)} interações vs ${fmtNum(feedInteractions)} do feed. Dobrar a produção de Reels com foco em trends, tutoriais rápidos e bastidores.`,
      priority: "média",
    });
  }

  // Crescimento lento
  const growthPct =
    firstFollowers > 0
      ? ((followers - firstFollowers) / firstFollowers) * 100
      : 0;
  if (growthPct < 5 && metrics.length >= 3) {
    actions.push({
      icon: Users,
      title: "Acelerar crescimento",
      description:
        "Crescimento abaixo de 5% no período. Implementar collabs, sorteios estratégicos e conteúdo compartilhável para ampliar a base de seguidores.",
      priority: "média",
    });
  }

  // Poucas publicações
  if (posts.length < 10) {
    actions.push({
      icon: Rocket,
      title: "Aumentar volume de publicações",
      description:
        "Menos de 10 publicações no período. Manter frequência mínima de 3-4 posts/semana para alimentar o algoritmo e manter consistência.",
      priority: "média",
    });
  }

  // Engajamento baixo nos posts
  const avgEngRate =
    posts.length > 0
      ? posts.reduce((sum, p) => {
          const m = (p.metrics ?? {}) as Record<string, unknown>;
          return sum + ((m.engagement_rate as number) ?? 0);
        }, 0) / posts.length
      : 0;
  if (avgEngRate < 3 && posts.length > 0) {
    actions.push({
      icon: Users,
      title: "Melhorar engajamento",
      description: `Taxa média de engajamento em ${avgEngRate.toFixed(1)}%. Usar CTAs diretos, perguntas nos textos e stickers de interação nos Stories para elevar participação.`,
      priority: "alta",
    });
  }

  return actions;
}
