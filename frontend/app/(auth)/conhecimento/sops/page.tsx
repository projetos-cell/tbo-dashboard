"use client";

import Link from "next/link";
import {
  IconCube,
  IconPalette,
  IconSpeakerphone,
  IconVideo,
  IconArrowRight,
  IconDeviceGamepad2,
  IconSettings,
  IconHeadset,
  IconChartLine,
  IconCurrencyDollar,
  IconUsers,
  IconHeartHandshake,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSops } from "@/features/conhecimento/hooks/use-sops";
import { SOP_BU_CONFIG, type SOPBu } from "@/features/conhecimento/types/sops";

const BU_ICONS: Record<SOPBu, React.ElementType> = {
  "digital-3d": IconCube,
  branding: IconPalette,
  marketing: IconSpeakerphone,
  audiovisual: IconVideo,
  gamificacao: IconDeviceGamepad2,
  operacoes: IconSettings,
  atendimento: IconHeadset,
  comercial: IconChartLine,
  financeiro: IconCurrencyDollar,
  "recursos-humanos": IconUsers,
  relacionamentos: IconHeartHandshake,
  politicas: IconShieldCheck,
  geral: IconCube,
};

const BU_LIST: SOPBu[] = [
  "digital-3d", "branding", "marketing", "audiovisual",
  "gamificacao", "operacoes", "atendimento", "comercial",
  "financeiro", "recursos-humanos", "relacionamentos", "politicas",
];

export default function SOPsIndexPage() {
  const { data: allSops } = useSops();

  const sopsByBu = (allSops ?? []).reduce<Record<string, number>>((acc, sop) => {
    acc[sop.bu] = (acc[sop.bu] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">SOPs</h1>
        <p className="text-muted-foreground mt-1">
          Procedimentos operacionais padrão por unidade de negócio.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BU_LIST.map((bu) => {
          const config = SOP_BU_CONFIG[bu];
          const Icon = BU_ICONS[bu];
          return (
            <Link key={bu} href={`/conhecimento/sops/${bu}`} className="group">
              <Card className="h-full transition-colors group-hover:border-tbo-orange/40">
                <CardContent className="p-5 flex items-center gap-4">
                  <div
                    className="rounded-lg p-3"
                    style={{ backgroundColor: `${config.color}15` }}
                  >
                    <Icon className="size-6" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{config.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {sopsByBu[bu] ?? 0} SOPs cadastrados
                    </p>
                  </div>
                  <IconArrowRight className="size-4 text-muted-foreground group-hover:text-tbo-orange transition-colors" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
