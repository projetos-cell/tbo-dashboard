"use client";

import { use } from "react";
import { IconCube, IconExternalLink } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  D3DPipelineBoard,
  D3DTimelineBar,
  D3D_STATUS_DISPLAY,
  useD3DFlowByToken,
} from "@/features/projects/d3d-pipeline";

interface PortalFluxoPageProps {
  params: Promise<{ token: string }>;
}

export default function PortalClienteFluxoPage({ params }: PortalFluxoPageProps) {
  const { token } = use(params);
  const { data: pipeline, isLoading, error } = useD3DFlowByToken(token);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <PortalTopbar projectName="Carregando..." />
        <div className="mx-auto max-w-7xl space-y-6 p-8">
          <Skeleton className="h-20 rounded-xl" />
          <div className="flex gap-3 overflow-x-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[380px] w-[268px] flex-shrink-0 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !pipeline) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <IconCube className="mx-auto h-12 w-12 text-zinc-300" />
          <h2 className="mt-4 text-lg font-medium text-zinc-900">
            Fluxo não encontrado
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Este link pode ter expirado ou o compartilhamento foi desativado.
          </p>
        </div>
      </div>
    );
  }

  // Compute progress
  const phases = pipeline.stages.filter((s) => s.stage_type === "phase");
  const completed = phases.filter((s) => s.status === "completed" || s.status === "approved");
  const progress = phases.length > 0 ? Math.round((completed.length / phases.length) * 100) : 0;

  // Current stage
  const currentStageIdx = pipeline.stages.findIndex(
    (s) => s.stage_key === pipeline.flow.current_stage
  );
  const currentConfig = pipeline.stages[currentStageIdx];

  return (
    <div className="min-h-screen bg-zinc-50">
      <PortalTopbar projectName={pipeline.project?.name ?? "Projeto"} />

      <div className="mx-auto max-w-full px-8 pb-12 pt-6">
        {/* Hero */}
        <div className="mb-6 flex items-end justify-between gap-8">
          <div className="max-w-xl">
            <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-widest text-zinc-400">
              <div className="h-1.5 w-1.5 rounded-sm bg-orange-600" />
              Pipeline · Digital 3D
            </div>
            <h1 className="text-3xl font-normal tracking-tight text-zinc-900">
              Fluxo de Projeto
              <br />
              <span className="text-zinc-500">{pipeline.project?.name ?? "Imagens 3D"}</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Acompanhe em tempo real o progresso da produção de imagens 3D do seu projeto.
              Cada etapa mostra o status atual, entregas e imagens de referência.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-shrink-0 gap-4">
            <StatCard value={phases.length} label="Fases" />
            <StatCard value={`${progress}%`} label="Progresso" />
            <StatCard
              value={pipeline.stages.filter((s) => s.stage_type === "gate").length}
              label="Entregas"
            />
          </div>
        </div>

        {/* Timeline */}
        <D3DTimelineBar stages={pipeline.stages} className="mb-6" />

        {/* Scroll hint */}
        <p className="mb-2 text-[11px] tracking-wider text-zinc-400 lg:hidden">
          ← scroll horizontal para navegar →
        </p>

        {/* Pipeline (read-only) */}
        <div className="overflow-x-auto pb-6">
          <D3DPipelineBoard stages={pipeline.stages} readOnly />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 pb-4">
          {[
            { color: "#E85102", label: "Kickoff / Input" },
            { color: "#3B82F6", label: "Referência" },
            { color: "#FD8241", label: "Produção TBO" },
            { color: "#F59E0B", label: "Entrega + Aprovação" },
            { color: "#10B981", label: "Aprovação Final" },
            { color: "#18181B", label: "Entrega Final" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs text-zinc-400">
              <div className="h-2.5 w-2.5 rounded" style={{ backgroundColor: item.color }} />
              {item.label}
            </div>
          ))}
        </div>

        {/* Footnote */}
        <div className="mx-auto max-w-3xl text-center text-xs leading-relaxed text-zinc-400">
          <strong className="font-medium text-zinc-500">Observações</strong>
          <br />
          Cada entrega requer aprovação formal por e-mail ou registro em ata antes da próxima rodada.
          Rodadas são entregues em JPG 72dpi via Google Drive. A entrega final inclui versões HQ
          (TIFF/PNG 300dpi) e web (JPG 72dpi). Tour 360° e Flythrough são opcionais conforme escopo.
          <br />
          <span className="mt-2 block text-[11px] italic text-zinc-300">
            Prazos estimados consideram projeto de complexidade média. Janelas de aprovação (3–5d) estão incluídas.
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────

function PortalTopbar({ projectName }: { projectName: string }) {
  return (
    <div className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-zinc-200 bg-white/90 px-8 backdrop-blur-xl">
      {/* TBO Logo placeholder */}
      <span className="text-lg font-bold tracking-tight text-zinc-900">tbo</span>
      <div className="h-5 w-px bg-zinc-200" />
      <span className="text-[13px] text-zinc-500">
        Digital 3D · <span className="text-zinc-900">{projectName}</span>
      </span>
      <span className="ml-auto rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-[11px] tracking-wide text-orange-600">
        Imagens 3D
      </span>
    </div>
  );
}

function StatCard({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="min-w-[88px] rounded-xl border border-zinc-200 bg-white px-5 py-4 text-center">
      <div className="text-2xl font-normal tracking-tight text-zinc-900">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-widest text-zinc-400">{label}</div>
    </div>
  );
}
