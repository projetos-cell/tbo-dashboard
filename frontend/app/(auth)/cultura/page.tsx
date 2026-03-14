"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconColumns3,
  IconRepeat,
  IconShield,
  IconAward,
  IconHeart,
  IconFileText,
  IconBookmark,
  IconArrowRight,
  IconGift,
  IconChartBar,
  IconSchool,
  IconBox,
  IconTool,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RequireRole } from "@/features/auth/components/require-role";
import { CulturaOverviewStats } from "@/features/cultura/components/cultura-overview-stats";
import { CulturaItemCard } from "@/features/cultura/components/cultura-item-card";
import { CulturaItemDetail } from "@/features/cultura/components/cultura-item-detail";
import { ErrorState, EmptyState } from "@/components/shared";
import { useCulturaItems } from "@/features/cultura/hooks/use-cultura";
import { useRecognitionKPIs } from "@/features/cultura/hooks/use-reconhecimentos";
import { useRitualTypes } from "@/features/cultura/hooks/use-ritual-types";
import { useRewardsKPIs } from "@/features/cultura/hooks/use-rewards";
import {
  CULTURA_CATEGORIES,
  type CulturaCategoryKey,
} from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type CulturaRow = Database["public"]["Tables"]["cultura_items"]["Row"];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  pilar: IconColumns3,
  ritual: IconRepeat,
  politica: IconShield,
  reconhecimento: IconAward,
  valor: IconHeart,
  documento: IconFileText,
  manual: IconBookmark,
};

const CATEGORY_LINKS: Record<string, string> = {
  pilar: "/cultura/pilares",
  valor: "/cultura/valores",
  ritual: "/cultura/rituais",
  politica: "/cultura/politicas",
  reconhecimento: "/cultura/reconhecimentos",
  documento: "/cultura/documentos",
  manual: "/cultura/manual",
};

export default function CulturaPage() {
  const router = useRouter();
  const { data: items, isLoading, error, refetch } = useCulturaItems();
  const { data: recKPIs } = useRecognitionKPIs();
  const { data: rituals } = useRitualTypes();
  const { data: rewardKPIs } = useRewardsKPIs();
  const [viewingId, setViewingId] = useState<string | null>(null);

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  }

  if (viewingId) {
    return (
      <CulturaItemDetail
        itemId={viewingId}
        onBack={() => setViewingId(null)}
      />
    );
  }

  // Get latest items per category (max 3 each)
  const recentByCategory = (items || []).reduce<
    Record<string, CulturaRow[]>
  >((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    if (acc[item.category].length < 3) acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cultura</h1>
        <p className="text-gray-500 mt-1">
          Visão geral dos pilares, rituais, políticas e reconhecimentos da
          empresa.
        </p>
      </div>

      <CulturaOverviewStats
        items={items}
        isLoading={isLoading}
        recognitionCount={recKPIs?.total}
        ritualCount={rituals?.length}
        rewardsCount={rewardKPIs?.activeRewards}
      />

      {/* Quick-access cards for specialized modules */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/cultura/reconhecimentos" className="group">
          <Card className="h-full transition-colors group-hover:border-tbo-orange/40">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-amber-500/10">
                <IconAward className="size-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Reconhecimentos</p>
                <p className="text-xs text-gray-500">
                  {recKPIs?.total ?? 0} total &middot;{" "}
                  {recKPIs?.thisMonth ?? 0} este mes
                </p>
              </div>
              <IconArrowRight className="size-4 text-gray-500 group-hover:text-tbo-orange transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/cultura/recompensas" className="group">
          <Card className="h-full transition-colors group-hover:border-tbo-orange/40">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-pink-500/10">
                <IconGift className="size-5 text-pink-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">TBO Rewards</p>
                <p className="text-xs text-gray-500">
                  {rewardKPIs?.activeRewards ?? 0} recompensas &middot;{" "}
                  {rewardKPIs?.pendingRedemptions ?? 0} pendentes
                </p>
              </div>
              <IconArrowRight className="size-4 text-gray-500 group-hover:text-tbo-orange transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/cultura/rituais" className="group">
          <Card className="h-full transition-colors group-hover:border-tbo-orange/40">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-blue-500/10">
                <IconRepeat className="size-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Rituais</p>
                <p className="text-xs text-gray-500">
                  {rituals?.filter((r) => r.is_active).length ?? 0} ativos de{" "}
                  {rituals?.length ?? 0}
                </p>
              </div>
              <IconArrowRight className="size-4 text-gray-500 group-hover:text-tbo-orange transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Novos módulos: Academy, Baú Criativo, Ferramentas */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/cultura/academy" className="group">
          <Card className="h-full transition-colors group-hover:border-emerald-400/40">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-emerald-500/10">
                <IconSchool className="size-5 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">TBO Academy</p>
                <p className="text-xs text-gray-500">
                  Trilha de aprendizado cultural
                </p>
              </div>
              <IconArrowRight className="size-4 text-gray-500 group-hover:text-emerald-500 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/cultura/bau-criativo" className="group">
          <Card className="h-full transition-colors group-hover:border-purple-400/40">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-purple-500/10">
                <IconBox className="size-5 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Baú Criativo</p>
                <p className="text-xs text-gray-500">
                  Referências e inspirações
                </p>
              </div>
              <IconArrowRight className="size-4 text-gray-500 group-hover:text-purple-500 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/cultura/ferramentas" className="group">
          <Card className="h-full transition-colors group-hover:border-cyan-400/40">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-cyan-500/10">
                <IconTool className="size-5 text-cyan-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Guia de Ferramentas</p>
                <p className="text-xs text-gray-500">
                  Ferramentas oficiais e boas praticas
                </p>
              </div>
              <IconArrowRight className="size-4 text-gray-500 group-hover:text-cyan-500 transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Analytics link — founder/diretoria only */}
      <RequireRole minRole="diretoria">
        <Link href="/cultura/analytics" className="group block">
          <Card className="transition-colors group-hover:border-indigo-400/40 bg-indigo-50/40 dark:bg-indigo-900/10 border-dashed">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-indigo-500/10">
                <IconChartBar className="size-5 text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Analytics de Cultura</p>
                <p className="text-xs text-gray-500">
                  Metricas e insights — visivel apenas para fundadores e gestores
                </p>
              </div>
              <IconArrowRight className="size-4 text-gray-500 group-hover:text-indigo-500 transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </RequireRole>

      {/* Category sections with recent items */}
      {(
        Object.entries(CULTURA_CATEGORIES) as [
          CulturaCategoryKey,
          (typeof CULTURA_CATEGORIES)[CulturaCategoryKey],
        ][]
      ).map(([key, def]) => {
        const catItems = recentByCategory[key] || [];
        if (catItems.length === 0) return null;
        const link = CATEGORY_LINKS[key];
        const Icon = CATEGORY_ICONS[key] || IconFileText;

        return (
          <Card key={key}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon className="size-4" style={{ color: def.color }} />
                {def.label}
              </CardTitle>
              {link && (
                <Link
                  href={link}
                  className="text-xs text-gray-500 hover:text-tbo-orange flex items-center gap-1"
                >
                  Ver todos
                  <IconArrowRight className="size-3" />
                </Link>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {catItems.map((item) => (
                  <CulturaItemCard
                    key={item.id}
                    item={item}
                    onView={(i) => setViewingId(i.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {!isLoading && (!items || items.length === 0) && (
        <EmptyState
          icon={IconHeart}
          title="Nenhum item de cultura cadastrado ainda"
          description="Comece adicionando pilares, rituais ou políticas."
          cta={{ label: "Ver pilares", onClick: () => router.push("/cultura/pilares") }}
        />
      )}
    </div>
  );
}
