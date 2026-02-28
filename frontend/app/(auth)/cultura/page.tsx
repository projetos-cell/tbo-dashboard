"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Columns3,
  Repeat,
  Shield,
  Award,
  Heart,
  FileText,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CulturaOverviewStats } from "@/components/cultura/cultura-overview-stats";
import { CulturaItemCard } from "@/components/cultura/cultura-item-card";
import { CulturaItemDetail } from "@/components/cultura/cultura-item-detail";
import { useCulturaItems } from "@/hooks/use-cultura";
import {
  CULTURA_CATEGORIES,
  type CulturaCategoryKey,
} from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type CulturaRow = Database["public"]["Tables"]["cultura_items"]["Row"];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  pilar: Columns3,
  ritual: Repeat,
  politica: Shield,
  reconhecimento: Award,
  valor: Heart,
  documento: FileText,
  manual: BookOpen,
};

const CATEGORY_LINKS: Record<string, string> = {
  pilar: "/cultura/pilares",
  ritual: "/cultura/rituais",
  politica: "/cultura/politicas",
  reconhecimento: "/cultura/reconhecimentos",
  manual: "/cultura/manual",
};

export default function CulturaPage() {
  const { data: items, isLoading } = useCulturaItems();
  const [viewingId, setViewingId] = useState<string | null>(null);

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
        <p className="text-muted-foreground mt-1">
          Visao geral dos pilares, rituais, politicas e reconhecimentos da
          empresa.
        </p>
      </div>

      <CulturaOverviewStats items={items} isLoading={isLoading} />

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
        const Icon = CATEGORY_ICONS[key] || FileText;

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
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  Ver todos
                  <ArrowRight className="size-3" />
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
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhum item de cultura cadastrado ainda.</p>
          <p className="text-sm mt-1">
            Comece adicionando pilares, rituais ou politicas.
          </p>
        </div>
      )}
    </div>
  );
}
