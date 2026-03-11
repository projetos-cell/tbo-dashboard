"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, TrendingUp, Target, Zap } from "lucide-react";
import {
  fmtNum,
  extractTopPosts,
  type RsmMetricRow,
  type RsmAccountRow,
  type RsmPostRow,
} from "./rsm-helpers";

interface Props {
  account: RsmAccountRow;
  metrics: RsmMetricRow[];
  posts: RsmPostRow[];
}

export function RsmPostsDiagnostics({ account, metrics, posts }: Props) {
  const latestMetric = metrics[metrics.length - 1];
  const firstMetric = metrics[0];
  const meta = (latestMetric?.metadata ?? {}) as Record<string, unknown>;
  const followers = account?.followers_count ?? 0;
  const firstFollowers = firstMetric?.followers ?? 0;
  const growthPct =
    firstFollowers > 0
      ? (((followers - firstFollowers) / firstFollowers) * 100).toFixed(1)
      : "0";

  // Formats
  const formats = (meta.formats as Record<string, Record<string, unknown>>) ?? {};
  const feed = formats.feed ?? {};
  const reels = formats.reels ?? {};
  const stories = formats.stories ?? {};

  // Reach
  const paid = (meta.reach_paid as number) ?? 0;
  const organic = (meta.reach_organic as number) ?? 0;
  const total = paid + organic;
  const paidPct = total > 0 ? ((paid / total) * 100).toFixed(1) : "0";

  // Audience
  const audience = (meta.audience as Record<string, unknown>) ?? {};
  const gender = (audience.gender as Record<string, number>) ?? {};
  const topCities = (audience.top_cities as Record<string, number>) ?? {};

  const topPosts = useMemo(() => extractTopPosts(posts), [posts]);

  return (
    <div className="space-y-8">
      {/* Formats */}
      {Object.keys(formats).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Performance por Formato</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <FormatCard title="Postagens do Feed" data={feed} />
            <FormatCard title="Reels" data={reels} highlight />
            <FormatCard title="Stories" data={stories} isStory />
          </div>
        </div>
      )}

      {/* Top Posts */}
      {topPosts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Top 5 Publicações</CardTitle>
              <Badge variant="outline" className="text-[10px]">por alcance</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Publicação</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Alcance</TableHead>
                    <TableHead className="text-right">Interações</TableHead>
                    <TableHead className="text-right">Eng. Rate</TableHead>
                    <TableHead className="text-right">Curtidas</TableHead>
                    <TableHead className="text-right">Coment.</TableHead>
                    <TableHead className="text-right">Saves</TableHead>
                    <TableHead className="text-right">Shares</TableHead>
                    <TableHead className="text-right">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPosts.map((p, i) => (
                    <TableRow key={i} className="transition-colors hover:bg-muted/50">
                      <TableCell className="max-w-[280px] truncate font-medium">{p.title}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtNum(p.views)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtNum(p.reach)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtNum(p.interactions)}</TableCell>
                      <TableCell className="text-right">
                        <EngBadge rate={p.engRate} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{fmtNum(p.likes)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtNum(p.comments)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtNum(p.saves)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtNum(p.shares)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{p.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diagnostics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Diagnóstico</h3>
        <div className="space-y-3">
          <InsightCard icon={<TrendingUp className="h-4 w-4" />} variant="info">
            <strong>Crescimento consistente (+{growthPct}%)</strong> — de ~{fmtNum(firstFollowers)} para{" "}
            {fmtNum(followers)} seguidores em {metrics.length} meses.
          </InsightCard>

          {(reels.interactions as number) > 0 && (
            <InsightCard icon={<Target className="h-4 w-4" />} variant="info">
              <strong>Reels dominam o engajamento</strong> —{" "}
              {fmtNum((reels.interactions as number) ?? 0)} interações nos Reels vs{" "}
              {fmtNum((feed.interactions as number) ?? 0)} no feed (
              {(feed.interactions as number) > 0
                ? (((reels.interactions as number) ?? 0) / ((feed.interactions as number) ?? 1)).toFixed(1)
                : "∞"}
              x mais).
            </InsightCard>
          )}

          {Number(paidPct) > 90 && (
            <InsightCard icon={<AlertCircle className="h-4 w-4" />} variant="warn">
              <strong>Dependência de mídia paga</strong> — {paidPct}% do alcance total vem de ads.
              Estratégia orgânica precisa ser fortalecida.
            </InsightCard>
          )}

          {(stories.reach_30d as number) === 0 && (
            <InsightCard icon={<Zap className="h-4 w-4" />} variant="alert">
              <strong>Stories zerados nos últimos 30 dias</strong> — alcance 0 indica interrupção total.
              Reativação recomendada.
            </InsightCard>
          )}

          {Object.keys(topCities).length > 0 && (
            <InsightCard icon={<Target className="h-4 w-4" />} variant="info">
              <strong>Audiência alinhada ao negócio</strong> —{" "}
              {((Object.values(topCities)[0] ?? 0) / Math.max(followers, 1) * 100).toFixed(1)}%
              concentrado em {Object.keys(topCities)[0]}.
              {gender.male ? ` ${gender.male}% masculino / ${gender.female}% feminino.` : ""}
            </InsightCard>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function FormatCard({
  title,
  data,
  highlight,
  isStory,
}: {
  title: string;
  data: Record<string, unknown>;
  highlight?: boolean;
  isStory?: boolean;
}) {
  const rows = isStory
    ? [
        ["Total publicado", data.total],
        ["Visualizações", data.views],
        ["Alcance (30d)", data.reach_30d],
        ["Interações", data.interactions],
        ["Respostas", data.replies],
        ["Shares", data.shares],
      ]
    : [
        ["Total publicado", data.total],
        ["Alcance (30d)", data.reach_30d],
        ["Interações", data.interactions],
        ["Curtidas", data.likes],
        ["Comentários", data.comments],
        ["Saves", data.saves],
        ["Shares", data.shares],
      ];

  return (
    <Card className={`transition-all hover:shadow-md hover:border-primary/20 ${highlight ? "border-primary/30 bg-primary/[0.02]" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className={`text-sm ${highlight ? "text-primary" : ""}`}>
            {title}
          </CardTitle>
          {highlight && (
            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
              Formato líder
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {rows.map(([label, val]) => (
          <div
            key={String(label)}
            className="flex justify-between py-2.5 border-b last:border-0"
          >
            <span className="text-sm text-muted-foreground">{String(label)}</span>
            <span
              className={`text-sm font-medium tabular-nums ${
                val === 0 && String(label).includes("Alcance")
                  ? "text-destructive"
                  : highlight && String(label) === "Interações"
                    ? "text-primary"
                    : ""
              }`}
            >
              {typeof val === "number" ? fmtNum(val) : String(val ?? "—")}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EngBadge({ rate }: { rate: number }) {
  const isHigh = rate >= 7;
  const isMid = rate >= 4 && rate < 7;
  return (
    <Badge
      variant="secondary"
      className={
        isHigh
          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
          : isMid
            ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
            : "bg-red-500/10 text-red-600 dark:text-red-400"
      }
    >
      {rate.toFixed(1)}%
    </Badge>
  );
}

function InsightCard({
  icon,
  variant,
  children,
}: {
  icon: React.ReactNode;
  variant: "info" | "warn" | "alert";
  children: React.ReactNode;
}) {
  const borderClass =
    variant === "warn"
      ? "border-l-orange-500"
      : variant === "alert"
        ? "border-l-destructive"
        : "border-l-primary";

  return (
    <div className={`flex gap-3 p-4 rounded-lg bg-muted/50 border-l-[3px] transition-colors hover:bg-muted/80 ${borderClass}`}>
      <span className="shrink-0 mt-0.5 text-muted-foreground">{icon}</span>
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}
