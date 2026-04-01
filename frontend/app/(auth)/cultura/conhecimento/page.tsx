"use client";

import Link from "next/link";
import {
  IconBookmark,
  IconCopy,
  IconMap,
  IconArrowRight,
  IconCube,
  IconPalette,
  IconSpeakerphone,
  IconVideo,
  IconDeviceGamepad2,
  IconSettings,
  IconHeadset,
  IconChartLine,
  IconCurrencyDollar,
  IconUsers,
  IconHeartHandshake,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSops } from "@/features/conhecimento/hooks/use-sops";
import type { SOPBu } from "@/features/conhecimento/types/sops";

const BU_CARDS: { bu: SOPBu; label: string; icon: React.ElementType; color: string; description: string }[] = [
  { bu: "digital-3d", label: "Digital 3D", icon: IconCube, color: "#8b5cf6", description: "Renders, animações, plantas humanizadas" },
  { bu: "branding", label: "Branding", icon: IconPalette, color: "#f59e0b", description: "Identidade visual, naming, brand book" },
  { bu: "marketing", label: "Marketing", icon: IconSpeakerphone, color: "#10b981", description: "Campanhas, mídia, performance" },
  { bu: "audiovisual", label: "Audiovisual", icon: IconVideo, color: "#ef4444", description: "Filmes, vídeos, motion graphics" },
  { bu: "gamificacao", label: "Gamificação", icon: IconDeviceGamepad2, color: "#ec4899", description: "Maquetes interativas, personalização" },
  { bu: "operacoes", label: "Operações", icon: IconSettings, color: "#6366f1", description: "Onboarding, projetos, QA, entregas" },
  { bu: "atendimento", label: "Atendimento", icon: IconHeadset, color: "#14b8a6", description: "Acompanhamento, handoff, feedbacks" },
  { bu: "comercial", label: "Comercial", icon: IconChartLine, color: "#f97316", description: "Prospecção, propostas, pipeline" },
  { bu: "financeiro", label: "Financeiro", icon: IconCurrencyDollar, color: "#22c55e", description: "Faturamento, contas, fluxo de caixa" },
  { bu: "recursos-humanos", label: "Recursos Humanos", icon: IconUsers, color: "#a855f7", description: "Recrutamento, avaliação, offboarding" },
  { bu: "relacionamentos", label: "Relacionamentos", icon: IconHeartHandshake, color: "#06b6d4", description: "Fornecedores, parcerias, reputação" },
  { bu: "politicas", label: "Políticas", icon: IconShieldCheck, color: "#64748b", description: "Conduta, segurança, propriedade intelectual" },
];

export default function ConhecimentoPage() {
  const { data: allSops } = useSops();

  const sopsByBu = (allSops ?? []).reduce<Record<string, number>>((acc, sop) => {
    acc[sop.bu] = (acc[sop.bu] ?? 0) + 1;
    return acc;
  }, {});

  const publishedCount = (allSops ?? []).filter((s) => s.status === "published").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Base de Conhecimento</h1>
        <p className="text-muted-foreground mt-1">
          SOPs, templates e guias operacionais da TBO.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg p-2.5 bg-blue-500/10">
              <IconBookmark className="size-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{allSops?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">SOPs total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg p-2.5 bg-green-500/10">
              <IconBookmark className="size-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{publishedCount}</p>
              <p className="text-xs text-muted-foreground">Publicados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg p-2.5 bg-purple-500/10">
              <IconBookmark className="size-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-muted-foreground">Áreas documentadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SOPs por BU */}
      <div>
        <h2 className="text-lg font-semibold mb-3">SOPs por Área</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BU_CARDS.map((bu) => (
            <Link
              key={bu.bu}
              href={`/conhecimento/sops/${bu.bu}`}
              className="group"
            >
              <Card className="h-full transition-colors group-hover:border-tbo-orange/40">
                <CardContent className="p-4 flex items-center gap-4">
                  <div
                    className="rounded-lg p-3"
                    style={{ backgroundColor: `${bu.color}15` }}
                  >
                    <bu.icon className="size-6" style={{ color: bu.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{bu.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {bu.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {sopsByBu[bu.bu] ?? 0} SOPs
                    </p>
                  </div>
                  <IconArrowRight className="size-4 text-muted-foreground group-hover:text-tbo-orange transition-colors" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Outros módulos */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Outros Recursos</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/cultura/conhecimento/templates" className="group">
            <Card className="h-full transition-colors group-hover:border-tbo-orange/40">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-lg p-2.5 bg-orange-500/10">
                  <IconCopy className="size-5 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Templates</p>
                  <p className="text-xs text-muted-foreground">
                    Modelos reutilizáveis de documentos e entregas
                  </p>
                </div>
                <IconArrowRight className="size-4 text-muted-foreground group-hover:text-tbo-orange transition-colors" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/cultura/conhecimento/guias" className="group">
            <Card className="h-full transition-colors group-hover:border-tbo-orange/40">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-lg p-2.5 bg-teal-500/10">
                  <IconMap className="size-5 text-teal-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Guias & Processos</p>
                  <p className="text-xs text-muted-foreground">
                    Fluxos operacionais e guias de ferramentas
                  </p>
                </div>
                <IconArrowRight className="size-4 text-muted-foreground group-hover:text-tbo-orange transition-colors" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
