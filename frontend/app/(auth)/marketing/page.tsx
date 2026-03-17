"use client";

import Link from "next/link";
import {
  IconMail,
  IconPencil,
  IconBrandInstagram,
  IconSpeakerphone,
  IconChartBar,
  IconArrowRight,
  IconTargetArrow,
  IconTemplate,
  IconCalendarEvent,
  IconPhoto,
  IconReportAnalytics,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RequireRole } from "@/features/auth/components/require-role";
import { useMarketingCampaigns } from "@/features/marketing/hooks/use-marketing-campaigns";
import { useContentItems } from "@/features/marketing/hooks/use-marketing-content";
import { MarketingApprovalsBadge } from "@/features/marketing/components/marketing-approvals-badge";
import { MarketingGlobalSearch } from "@/features/marketing/components/marketing-global-search";

function KPICard({
  label,
  value,
  sub,
  isLoading,
}: {
  label: string;
  value: string;
  sub?: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-3 w-28" />
      </div>
    );
  }
  return (
    <div className="rounded-lg border bg-card p-4 space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

type ModuleCard = {
  href: string;
  label: string;
  description: string;
  icon: typeof IconMail;
  color: string;
  bgClass: string;
  minRole?: "founder" | "diretoria" | "lider";
};

const MODULE_CARDS: ModuleCard[] = [
  {
    href: "/marketing/email-studio",
    label: "Email Studio",
    description: "Templates, campanhas e envios de email marketing",
    icon: IconMail,
    color: "#3b82f6",
    bgClass: "bg-blue-500/10",
  },
  {
    href: "/marketing/conteudo",
    label: "Conteudo",
    description: "Calendario editorial, briefs e biblioteca de assets",
    icon: IconPencil,
    color: "#8b5cf6",
    bgClass: "bg-purple-500/10",
  },
  {
    href: "/marketing/redes-sociais",
    label: "Redes Sociais",
    description: "Contas, agendamento e performance por canal",
    icon: IconBrandInstagram,
    color: "#ec4899",
    bgClass: "bg-pink-500/10",
  },
  {
    href: "/marketing/campanhas",
    label: "Campanhas",
    description: "Timeline de campanhas, briefings e budget",
    icon: IconSpeakerphone,
    color: "#f59e0b",
    bgClass: "bg-amber-500/10",
  },
  {
    href: "/marketing/analytics",
    label: "Analytics",
    description: "Dashboard consolidado, funil e atribuicao",
    icon: IconChartBar,
    color: "#22c55e",
    bgClass: "bg-emerald-500/10",
    minRole: "diretoria",
  },
  {
    href: "/marketing/rsm",
    label: "RSM",
    description: "Relatório Semanal de Mídias com diagnóstico e recomendações",
    icon: IconReportAnalytics,
    color: "#6366f1",
    bgClass: "bg-indigo-500/10",
  },
];

function MarketingPageContent() {
  const { data: campaigns, isLoading: loadingCampaigns } = useMarketingCampaigns();
  const { data: content, isLoading: loadingContent } = useContentItems();

  const activeCampaigns = campaigns?.filter((c) => c.status === "ativa").length ?? 0;
  const totalCampaigns = campaigns?.length ?? 0;
  const pendingContent = content?.filter((c) => c.status === "revisao" || c.status === "briefing").length ?? 0;
  const publishedContent = content?.filter((c) => c.status === "publicado").length ?? 0;

  const isLoading = loadingCampaigns || loadingContent;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketing</h1>
          <p className="text-muted-foreground mt-1">
            Central de marketing: email, conteudo, redes sociais, campanhas e analytics.
          </p>
        </div>
        {/* Feature #69 — busca global */}
        <MarketingGlobalSearch />
      </div>

      {/* Feature #68 — badge de aprovações pendentes */}
      <MarketingApprovalsBadge />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPICard
          label="Campanhas ativas"
          value={String(activeCampaigns)}
          sub={`de ${totalCampaigns} total`}
          isLoading={isLoading}
        />
        <KPICard
          label="Conteudos pendentes"
          value={String(pendingContent)}
          sub="aguardando revisao/briefing"
          isLoading={isLoading}
        />
        <KPICard
          label="Publicados"
          value={String(publishedContent)}
          sub="conteudos publicados"
          isLoading={isLoading}
        />
        <KPICard
          label="Total campanhas"
          value={String(totalCampaigns)}
          isLoading={isLoading}
        />
      </div>

      {/* Quick access highlights */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/marketing/email-studio/templates" className="group">
          <Card className="h-full transition-colors group-hover:border-blue-400/40">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-blue-500/10">
                <IconTemplate className="size-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Templates de Email</p>
                <p className="text-xs text-muted-foreground">Criar e editar templates</p>
              </div>
              <IconArrowRight className="size-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/marketing/conteudo/calendario" className="group">
          <Card className="h-full transition-colors group-hover:border-purple-400/40">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-purple-500/10">
                <IconCalendarEvent className="size-5 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Calendario Editorial</p>
                <p className="text-xs text-muted-foreground">Planejar publicacoes</p>
              </div>
              <IconArrowRight className="size-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/marketing/conteudo/assets" className="group">
          <Card className="h-full transition-colors group-hover:border-pink-400/40">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-pink-500/10">
                <IconPhoto className="size-5 text-pink-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Biblioteca de Assets</p>
                <p className="text-xs text-muted-foreground">Criativos e arquivos</p>
              </div>
              <IconArrowRight className="size-4 text-muted-foreground group-hover:text-pink-500 transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Module cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULE_CARDS.map((mod) => {
          const Icon = mod.icon;
          const card = (
            <Link key={mod.href} href={mod.href} className="group">
              <Card className="h-full transition-colors group-hover:border-orange-400/40">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2.5 ${mod.bgClass}`}>
                      <Icon className="size-5" style={{ color: mod.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{mod.label}</p>
                    </div>
                    <IconArrowRight className="size-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                  </div>
                  <p className="text-sm text-muted-foreground">{mod.description}</p>
                </CardContent>
              </Card>
            </Link>
          );

          if (mod.minRole) {
            return (
              <RequireRole key={mod.href} minRole={mod.minRole}>
                {card}
              </RequireRole>
            );
          }
          return card;
        })}
      </div>
    </div>
  );
}

export default function MarketingPage() {
  return (
    <RequireRole module="marketing">
      <MarketingPageContent />
    </RequireRole>
  );
}
