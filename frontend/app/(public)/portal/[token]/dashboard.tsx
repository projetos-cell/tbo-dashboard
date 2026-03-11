"use client";

import { useMemo } from "react";
import type { Database } from "@/lib/supabase/types";

type Account = Database["public"]["Tables"]["rsm_accounts"]["Row"];
type Metric = Database["public"]["Tables"]["rsm_metrics"]["Row"];
type Post = Database["public"]["Tables"]["rsm_posts"]["Row"];

interface Props {
  clientName: string;
  accounts: Account[];
  metrics: Metric[];
  posts: Post[];
}

// ─── CSS Variables ───
const colors = {
  bg: "#080c10",
  surface: "#0d1117",
  surface2: "#131a23",
  border: "#1a2332",
  borderLight: "#243044",
  text: "#e8e8e8",
  muted: "#8a9ab5",
  dim: "#4a5f7a",
  blue: "#007AD3",
  blueLight: "#0093FF",
  blueDark: "#003861",
  blueDim: "rgba(0,122,211,0.12)",
  blueGlow: "rgba(0,122,211,0.06)",
  orange: "#FF9437",
  orangeDim: "rgba(255,148,55,0.12)",
  red: "#ef5350",
  redDim: "rgba(239,83,80,0.12)",
  green: "#4caf50",
  greenDim: "rgba(76,175,80,0.12)",
} as const;

const MONTHS_PT: Record<number, string> = {
  1: "Jan",
  2: "Fev",
  3: "Mar",
  4: "Abr",
  5: "Mai",
  6: "Jun",
  7: "Jul",
  8: "Ago",
  9: "Set",
  10: "Out",
  11: "Nov",
  12: "Dez",
};

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2).replace(".", ",")}M`;
  if (n >= 1_000) return n.toLocaleString("pt-BR");
  return String(n);
}

function fmtDate(d: string | null): string {
  if (!d) return "—";
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function PortalRsmDashboard({
  clientName,
  accounts,
  metrics,
  posts,
}: Props) {
  const account = accounts[0];
  const latestMetric = metrics[metrics.length - 1];
  const meta = (latestMetric?.metadata ?? {}) as Record<string, unknown>;

  // ─── Derived data ───
  const totalViews = (meta.total_views as number) ?? 0;
  const totalInteractions = (meta.total_interactions as number) ?? 0;
  const profileVisits = latestMetric?.profile_views ?? 0;
  const followers = account?.followers_count ?? 0;

  const firstMetric = metrics[0];
  const firstFollowers = firstMetric?.followers ?? 0;
  const growthPct =
    firstFollowers > 0
      ? (((followers - firstFollowers) / firstFollowers) * 100).toFixed(1)
      : "0";

  const firstDate = firstMetric
    ? `${String(new Date(firstMetric.date).getDate()).padStart(2, "0")} ${MONTHS_PT[new Date(firstMetric.date).getMonth() + 1]} ${new Date(firstMetric.date).getFullYear()}`
    : "";
  const lastDate = latestMetric
    ? `${String(new Date(latestMetric.date).getDate()).padStart(2, "0")} ${MONTHS_PT[new Date(latestMetric.date).getMonth() + 1]} ${new Date(latestMetric.date).getFullYear()}`
    : "";

  // Reach data from latest metric metadata
  const reachData = useMemo(() => {
    const paid = (meta.reach_paid as number) ?? 0;
    const organic = (meta.reach_organic as number) ?? 0;
    const total = paid + organic;
    const paidPct = total > 0 ? ((paid / total) * 100).toFixed(1) : "0";
    const orgPct = total > 0 ? ((organic / total) * 100).toFixed(1) : "0";
    return { paid, organic, total, paidPct, orgPct };
  }, [meta]);

  // Audience data
  const audience = (meta.audience as Record<string, unknown>) ?? {};
  const gender = (audience.gender as Record<string, number>) ?? {};
  const topCities = (audience.top_cities as Record<string, number>) ?? {};
  const ageRanges = (audience.age_ranges as Record<string, number>) ?? {};
  const maxCity = Math.max(...Object.values(topCities), 1);
  const maxAge = Math.max(...Object.values(ageRanges), 1);

  // Formats data
  const formats = (meta.formats as Record<string, Record<string, unknown>>) ?? {};
  const feed = formats.feed ?? {};
  const reels = formats.reels ?? {};
  const stories = formats.stories ?? {};

  // Top posts with metrics
  const topPosts = useMemo(() => {
    return posts.slice(0, 5).map((p) => {
      const m = (p.metrics ?? {}) as Record<string, unknown>;
      return {
        title: p.title ?? "Sem título",
        views: (m.views as number) ?? 0,
        reach: (m.reach as number) ?? 0,
        interactions: (m.interactions as number) ?? 0,
        engRate: (m.engagement_rate as number) ?? 0,
        likes: (m.likes as number) ?? 0,
        comments: (m.comments as number) ?? 0,
        saves: (m.saves as number) ?? 0,
        shares: (m.shares as number) ?? 0,
        date: fmtDate(p.published_date),
      };
    });
  }, [posts]);

  return (
    <div
      style={{
        maxWidth: 1320,
        margin: "0 auto",
        padding: "40px 24px 80px",
        fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
      }}
    >
      {/* ─── Header ─── */}
      <header
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 48,
          paddingBottom: 32,
          borderBottom: `1px solid ${colors.border}`,
          position: "relative",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: -1,
            left: 0,
            width: 200,
            height: 2,
            background: `linear-gradient(90deg, ${colors.blue}, transparent)`,
          }}
        />
        <div>
          <h1
            style={{
              fontSize: 48,
              fontWeight: 400,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {clientName.split(" ").map((word, i) =>
              i === 0 ? (
                <span key={i}>{word} </span>
              ) : (
                <span key={i} style={{ color: colors.blue }}>
                  {word}{" "}
                </span>
              )
            )}
          </h1>
          <p
            style={{
              fontSize: 14,
              color: colors.muted,
              marginTop: 8,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Social Media Dashboard · Instagram Business
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{ fontSize: 13, color: colors.muted, letterSpacing: "0.02em" }}
          >
            {firstDate} — {lastDate}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 8,
              padding: "6px 14px",
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: 100,
              fontSize: 12,
              color: colors.muted,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: "linear-gradient(135deg, #E1306C, #F77737, #FCAF45)",
                borderRadius: "50%",
              }}
            />
            @{account?.handle}
          </div>
        </div>
      </header>

      {/* ─── KPI Grid ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 40,
        }}
      >
        <KpiCard
          label="Seguidores"
          value={fmtNum(followers)}
          sub={`de ~${fmtNum(firstMetric?.followers ?? 0)} em ${MONTHS_PT[new Date(firstMetric?.date ?? "").getMonth() + 1] ?? ""}/${String(new Date(firstMetric?.date ?? "").getFullYear()).slice(2)}`}
          badge={`↑ +${growthPct}%`}
          badgeColor="blue"
        />
        <KpiCard
          label="Visualizações Totais"
          value={fmtNum(totalViews)}
          valueColor={colors.blueLight}
          sub="orgânicas + pagas"
        />
        <KpiCard
          label="Interações Totais"
          value={fmtNum(totalInteractions)}
          sub="curtidas, comentários, saves, shares"
        />
        <KpiCard
          label="Visitas ao Perfil"
          value={fmtNum(profileVisits)}
          sub="no período analisado"
        />
      </div>

      {/* ─── Alcance últimos 30 dias ─── */}
      {reachData.total > 0 && (
        <Section title="Alcance · últimos 30 dias">
          <Card>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <MiniKpi label="Alcance Total" value={fmtNum(reachData.total)} />
              <MiniKpi
                label="Pago"
                value={fmtNum(reachData.paid)}
                color={colors.orange}
              />
              <MiniKpi
                label="Orgânico"
                value={fmtNum(reachData.organic)}
                color={colors.blueLight}
              />
              <MiniKpi
                label="% Pago"
                value={`${reachData.paidPct}%`}
                color={colors.muted}
              />
            </div>
            {/* Stacked bar */}
            <div
              style={{
                display: "flex",
                height: 40,
                borderRadius: 8,
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  flex: Number(reachData.paidPct),
                  background: `linear-gradient(90deg, ${colors.orange}, #ffb060)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#000",
                }}
              >
                Pago · {reachData.paidPct}%
              </div>
              <div
                style={{
                  flex: Number(reachData.orgPct),
                  background: colors.blue,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  color: "#fff",
                }}
              >
                {Number(reachData.orgPct) > 3 ? `${reachData.orgPct}%` : ""}
              </div>
            </div>
            <p style={{ fontSize: 12, color: colors.dim }}>
              Distribuição indica forte dependência de mídia paga. Orgânico
              representa apenas {reachData.orgPct}% do alcance total nos últimos
              30 dias.
            </p>
          </Card>
        </Section>
      )}

      {/* ─── Crescimento de Seguidores ─── */}
      <Section title="Crescimento de Seguidores">
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
              height: 160,
              paddingTop: 20,
            }}
          >
            {metrics.map((m, i) => {
              const maxF = Math.max(...metrics.map((x) => x.followers), 1);
              const pct = (m.followers / maxF) * 100;
              const month =
                MONTHS_PT[new Date(m.date).getMonth() + 1] ?? "";
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    height: "100%",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      borderRadius: "6px 6px 0 0",
                      background: `linear-gradient(180deg, ${colors.blueLight}, ${colors.blue}, ${colors.blueDark})`,
                      height: `${pct}%`,
                      position: "relative",
                      minHeight: 4,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: -22,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: 11,
                        fontWeight: 500,
                        color: colors.blueLight,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fmtNum(m.followers)}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: colors.dim,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {month}
                  </span>
                </div>
              );
            })}
          </div>
          <p style={{ marginTop: 20, fontSize: 12, color: colors.dim }}>
            Crescimento médio de ~{metrics.length > 1 ? Math.round((followers - (firstMetric?.followers ?? 0)) / Math.max(metrics.length - 1, 1)) : 0}{" "}
            seguidores/mês · Ritmo constante sem picos artificiais
          </p>
        </Card>
      </Section>

      {/* ─── Audiência ─── */}
      {(Object.keys(gender).length > 0 || Object.keys(topCities).length > 0) && (
        <Section title="Audiência">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Gender donut */}
            {Object.keys(gender).length > 0 && (
              <Card>
                <CardTitle>Seguidores por Gênero</CardTitle>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 32 }}
                >
                  <svg viewBox="0 0 120 120" width={140} height={140}>
                    <circle
                      cx={60}
                      cy={60}
                      r={48}
                      fill="none"
                      stroke={colors.surface2}
                      strokeWidth={18}
                    />
                    <circle
                      cx={60}
                      cy={60}
                      r={48}
                      fill="none"
                      stroke={colors.blue}
                      strokeWidth={18}
                      strokeDasharray={`${(gender.male ?? 0) / 100 * 301.6} 301.6`}
                      strokeDashoffset={0}
                      transform="rotate(-90 60 60)"
                      strokeLinecap="round"
                    />
                    <circle
                      cx={60}
                      cy={60}
                      r={48}
                      fill="none"
                      stroke={colors.orange}
                      strokeWidth={18}
                      strokeDasharray={`${(gender.female ?? 0) / 100 * 301.6} 301.6`}
                      strokeDashoffset={-((gender.male ?? 0) / 100 * 301.6)}
                      transform="rotate(-90 60 60)"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <LegendItem
                      color={colors.blue}
                      label="Masculino"
                      pct={`${gender.male ?? 0}%`}
                    />
                    <LegendItem
                      color={colors.orange}
                      label="Feminino"
                      pct={`${gender.female ?? 0}%`}
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Top cities */}
            {Object.keys(topCities).length > 0 && (
              <Card>
                <CardTitle>Top Cidades</CardTitle>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  {Object.entries(topCities)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([city, count]) => (
                      <BarRow
                        key={city}
                        label={city}
                        value={fmtNum(count)}
                        pct={(count / maxCity) * 100}
                      />
                    ))}
                </div>
              </Card>
            )}
          </div>
        </Section>
      )}

      {/* ─── Faixa Etária ─── */}
      {Object.keys(ageRanges).length > 0 && (
        <Section title="Audiência por Faixa Etária">
          <Card>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 12,
                height: 140,
              }}
            >
              {Object.entries(ageRanges).map(([range, count]) => {
                const pct = (count / maxAge) * 100;
                const isPeak = pct >= 90;
                return (
                  <div
                    key={range}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      height: "100%",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        borderRadius: "6px 6px 0 0",
                        height: `${Math.max(pct, 4)}%`,
                        background: isPeak
                          ? `linear-gradient(180deg, ${colors.blueLight}, ${colors.blue})`
                          : pct > 20
                            ? `linear-gradient(180deg, ${colors.blue}, rgba(0,122,211,0.3))`
                            : colors.surface2,
                      }}
                    />
                    <span style={{ fontSize: 11, color: colors.dim }}>
                      {range}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: isPeak ? colors.blueLight : colors.muted,
                        fontWeight: isPeak ? 600 : 400,
                      }}
                    >
                      {fmtNum(count)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </Section>
      )}

      {/* ─── Performance por Formato ─── */}
      {Object.keys(formats).length > 0 && (
        <Section title="Performance por Formato">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
            }}
          >
            <FormatCard title="Postagens do Feed" data={feed} />
            <FormatCard
              title="Reels"
              data={reels}
              highlight
              badge="Formato líder"
            />
            <FormatCard title="Stories" data={stories} isStory />
          </div>
        </Section>
      )}

      {/* ─── Top 5 Posts ─── */}
      {topPosts.length > 0 && (
        <Section title="Top 5 Publicações" tag="por alcance">
          <Card>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr>
                    {[
                      "Publicação",
                      "Views",
                      "Alcance",
                      "Interações",
                      "Eng. Rate",
                      "Curtidas",
                      "Coment.",
                      "Saves",
                      "Shares",
                      "Data",
                    ].map((h, i) => (
                      <th
                        key={h}
                        style={{
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: colors.dim,
                          padding: "0 12px 14px",
                          borderBottom: `1px solid ${colors.border}`,
                          textAlign: i === 0 ? "left" : "right",
                          fontWeight: 500,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topPosts.map((p, i) => (
                    <tr key={i}>
                      <td
                        style={{
                          padding: "14px 12px",
                          borderBottom: `1px solid ${colors.border}`,
                          color: colors.text,
                          maxWidth: 280,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {p.title}
                      </td>
                      {[
                        p.views,
                        p.reach,
                        p.interactions,
                      ].map((v, j) => (
                        <td
                          key={j}
                          style={{
                            padding: "14px 12px",
                            borderBottom: `1px solid ${colors.border}`,
                            color: colors.muted,
                            textAlign: "right",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {fmtNum(v)}
                        </td>
                      ))}
                      <td
                        style={{
                          padding: "14px 12px",
                          borderBottom: `1px solid ${colors.border}`,
                          textAlign: "right",
                        }}
                      >
                        <EngBadge rate={p.engRate} />
                      </td>
                      {[p.likes, p.comments, p.saves, p.shares].map(
                        (v, j) => (
                          <td
                            key={j}
                            style={{
                              padding: "14px 12px",
                              borderBottom: `1px solid ${colors.border}`,
                              color: colors.muted,
                              textAlign: "right",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {fmtNum(v)}
                          </td>
                        )
                      )}
                      <td
                        style={{
                          padding: "14px 12px",
                          borderBottom: `1px solid ${colors.border}`,
                          color: colors.muted,
                          textAlign: "right",
                        }}
                      >
                        {p.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Section>
      )}

      {/* ─── Diagnóstico ─── */}
      <Section title="Diagnóstico">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Insight icon="↗">
            <strong>Crescimento consistente (+{growthPct}%)</strong> — de ~
            {fmtNum(firstMetric?.followers ?? 0)} para {fmtNum(followers)}{" "}
            seguidores em {metrics.length} meses. Ritmo orgânico saudável.
          </Insight>
          {(reels.interactions as number) > 0 && (
            <Insight icon="◎">
              <strong>Reels dominam o engajamento</strong> —{" "}
              {fmtNum((reels.interactions as number) ?? 0)} interações nos Reels
              vs {fmtNum((feed.interactions as number) ?? 0)} no feed (
              {(feed.interactions as number) > 0
                ? (
                    ((reels.interactions as number) ?? 0) /
                    ((feed.interactions as number) ?? 1)
                  ).toFixed(1)
                : "∞"}
              x mais).
            </Insight>
          )}
          {Number(reachData.paidPct) > 90 && (
            <Insight icon="⚠" variant="warn">
              <strong>Dependência de mídia paga</strong> — {reachData.paidPct}%
              do alcance total vem de ads. Estratégia orgânica precisa ser
              fortalecida.
            </Insight>
          )}
          {(stories.reach_30d as number) === 0 && (
            <Insight icon="●" variant="alert">
              <strong>Stories zerados nos últimos 30 dias</strong> — alcance 0
              indica interrupção total no formato. Reativação recomendada.
            </Insight>
          )}
          {Object.keys(topCities).length > 0 && (
            <Insight icon="◉">
              <strong>Audiência alinhada ao negócio</strong> —{" "}
              {((Object.values(topCities)[0] ?? 0) / followers * 100).toFixed(1)}%
              concentrado em {Object.keys(topCities)[0]}.
              {gender.male ? ` Gênero ${gender.male}% masculino / ${gender.female}% feminino.` : ""}
            </Insight>
          )}
        </div>
      </Section>

      {/* ─── Footer ─── */}
      <footer
        style={{
          marginTop: 60,
          paddingTop: 24,
          borderTop: `1px solid ${colors.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: colors.dim,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.12em",
              color: colors.blue,
            }}
          >
            TBO
          </span>{" "}
          · Relatório gerado em{" "}
          {MONTHS_PT[new Date().getMonth() + 1]}/{new Date().getFullYear()}
        </div>
        <div style={{ fontSize: 11, color: colors.dim }}>
          Dados: Instagram Business · @{account?.handle} · Período: {firstDate}{" "}
          — {lastDate}
        </div>
      </footer>
    </div>
  );
}

/* ─── Sub-components ─── */

function Section({
  title,
  tag,
  children,
}: {
  title: string;
  tag?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 28, fontWeight: 400 }}>{title}</h2>
        {tag && (
          <span
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              padding: "4px 10px",
              background: colors.surface2,
              border: `1px solid ${colors.border}`,
              borderRadius: 100,
              color: colors.muted,
            }}
          >
            {tag}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Card({
  children,
  highlight,
}: {
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        background: highlight
          ? `linear-gradient(180deg, rgba(0,122,211,0.04), ${colors.surface})`
          : colors.surface,
        border: `1px solid ${highlight ? "rgba(0,122,211,0.3)" : colors.border}`,
        borderRadius: 12,
        padding: 28,
      }}
    >
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: colors.dim,
        marginBottom: 20,
      }}
    >
      {children}
    </div>
  );
}

function KpiCard({
  label,
  value,
  valueColor,
  sub,
  badge,
  badgeColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
  sub?: string;
  badge?: string;
  badgeColor?: "blue" | "green" | "orange" | "red";
}) {
  const badgeStyles: Record<string, { bg: string; fg: string }> = {
    blue: { bg: colors.blueDim, fg: colors.blueLight },
    green: { bg: colors.greenDim, fg: colors.green },
    orange: { bg: colors.orangeDim, fg: colors.orange },
    red: { bg: colors.redDim, fg: colors.red },
  };
  const bs = badgeColor ? badgeStyles[badgeColor] : undefined;

  return (
    <div
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: 24,
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: colors.dim,
          marginBottom: 12,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: valueColor ?? colors.text,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: colors.muted, marginTop: 8 }}>
          {sub}
        </div>
      )}
      {badge && bs && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 8px",
            borderRadius: 100,
            fontSize: 11,
            fontWeight: 500,
            marginTop: 10,
            background: bs.bg,
            color: bs.fg,
          }}
        >
          {badge}
        </div>
      )}
    </div>
  );
}

function MiniKpi({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: colors.surface2,
        borderRadius: 8,
        padding: 16,
        textAlign: "center",
      }}
    >
      <div
        style={{ fontSize: 22, fontWeight: 600, color: color ?? colors.text }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: colors.dim,
          marginTop: 6,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function BarRow({
  label,
  value,
  pct,
}: {
  label: string;
  value: string;
  pct: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span
        style={{
          fontSize: 13,
          color: colors.muted,
          width: 140,
          flexShrink: 0,
          textAlign: "right",
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 28,
          background: colors.surface2,
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 6,
            background: `linear-gradient(90deg, ${colors.blueDark}, ${colors.blue}, ${colors.blueLight})`,
          }}
        />
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: colors.text,
          width: 60,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function LegendItem({
  color,
  label,
  pct,
}: {
  color: string;
  label: string;
  pct: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 13, color: colors.muted }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, marginLeft: "auto" }}>
        {pct}
      </span>
    </div>
  );
}

function EngBadge({ rate }: { rate: number }) {
  const isHigh = rate >= 7;
  const isMid = rate >= 4 && rate < 7;
  const bg = isHigh ? colors.blueDim : isMid ? colors.orangeDim : colors.redDim;
  const fg = isHigh ? colors.blueLight : isMid ? colors.orange : colors.red;
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "2px 8px",
        borderRadius: 100,
        fontSize: 12,
        fontWeight: 500,
        background: bg,
        color: fg,
      }}
    >
      {rate.toFixed(1)}%
    </span>
  );
}

function FormatCard({
  title,
  data,
  highlight,
  badge,
  isStory,
}: {
  title: string;
  data: Record<string, unknown>;
  highlight?: boolean;
  badge?: string;
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
        ["Retenção média", data.retention],
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
    <Card highlight={highlight}>
      <div
        style={{
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: highlight ? colors.blueLight : colors.dim,
          marginBottom: 20,
        }}
      >
        {title} {badge && `★ ${badge}`}
      </div>
      {rows.map(([label, val]) => (
        <div
          key={String(label)}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "14px 0",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <span style={{ fontSize: 13, color: colors.muted }}>
            {String(label)}
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color:
                val === 0 && String(label).includes("Alcance")
                  ? colors.red
                  : highlight && String(label) === "Interações"
                    ? colors.blueLight
                    : colors.text,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {typeof val === "number" ? fmtNum(val) : String(val ?? "—")}
          </span>
        </div>
      ))}
    </Card>
  );
}

function Insight({
  icon,
  variant,
  children,
}: {
  icon: string;
  variant?: "warn" | "alert";
  children: React.ReactNode;
}) {
  const borderColor =
    variant === "warn"
      ? colors.orange
      : variant === "alert"
        ? colors.red
        : colors.blue;
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        padding: "18px 20px",
        background: colors.surface2,
        borderRadius: 8,
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <p style={{ fontSize: 13, color: colors.muted, lineHeight: 1.6 }}>
        {children}
      </p>
    </div>
  );
}
