"use client";

import Link from "next/link";
import {
  IconCalendarEvent,
  IconFileText,
  IconPhoto,
  IconCheckbox,
  IconArrowRight,
  IconPencil,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RequireRole } from "@/features/auth/components/require-role";
import { useContentItems, useContentBriefs, useContentAssets, useContentApprovals } from "@/features/marketing/hooks/use-marketing-content";

function KPICard({ label, value, isLoading }: { label: string; value: string; isLoading?: boolean }) {
  if (isLoading) return <div className="rounded-lg border bg-card p-4 space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-7 w-16" /></div>;
  return <div className="rounded-lg border bg-card p-4 space-y-1"><p className="text-xs text-muted-foreground">{label}</p><p className="text-2xl font-bold">{value}</p></div>;
}

const SECTIONS = [
  { href: "/marketing/conteudo/calendario", label: "Calendario Editorial", description: "Planeje e visualize publicacoes no calendario", icon: IconCalendarEvent, color: "#8b5cf6", bgClass: "bg-purple-500/10" },
  { href: "/marketing/conteudo/briefs", label: "Briefs", description: "Briefs de conteudo para producao", icon: IconFileText, color: "#3b82f6", bgClass: "bg-blue-500/10" },
  { href: "/marketing/conteudo/assets", label: "Biblioteca de Assets", description: "Criativos, imagens e arquivos de campanha", icon: IconPhoto, color: "#ec4899", bgClass: "bg-pink-500/10" },
  { href: "/marketing/conteudo/aprovacoes", label: "Aprovacoes", description: "Workflow de revisao e aprovacao de conteudo", icon: IconCheckbox, color: "#22c55e", bgClass: "bg-emerald-500/10" },
] as const;

function ConteudoContent() {
  const { data: items, isLoading: l1 } = useContentItems();
  const { data: briefs, isLoading: l2 } = useContentBriefs();
  const { data: assets, isLoading: l3 } = useContentAssets();
  const { data: approvals, isLoading: l4 } = useContentApprovals();
  const isLoading = l1 || l2 || l3 || l4;

  const pending = approvals?.filter((a) => a.status === "pending").length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conteudo</h1>
        <p className="text-sm text-muted-foreground">Gestao de conteudo, briefs, assets e aprovacoes.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPICard label="Conteudos" value={String(items?.length ?? 0)} isLoading={isLoading} />
        <KPICard label="Briefs" value={String(briefs?.length ?? 0)} isLoading={isLoading} />
        <KPICard label="Assets" value={String(assets?.length ?? 0)} isLoading={isLoading} />
        <KPICard label="Aprovacoes pendentes" value={String(pending)} isLoading={isLoading} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href} className="group">
              <Card className="h-full transition-colors group-hover:border-purple-400/40">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`rounded-lg p-3 ${s.bgClass}`}>
                    <Icon className="size-6" style={{ color: s.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{s.label}</p>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                  </div>
                  <IconArrowRight className="size-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function ConteudoPage() {
  return (
    <RequireRole module="marketing">
      <ConteudoContent />
    </RequireRole>
  );
}
