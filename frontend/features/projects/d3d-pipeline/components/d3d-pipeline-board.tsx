"use client";

import { useState, useCallback } from "react";
import { D3D_STAGE_CONFIGS } from "../constants";
import type { D3DStageState } from "../types";
import { D3DStageCard } from "./d3d-stage-card";
import { D3DGateNode } from "./d3d-gate-node";
import { D3DConnector } from "./d3d-connector";
import { D3DImageDrawer } from "./d3d-image-drawer";

interface D3DPipelineBoardProps {
  stages: D3DStageState[];
  readOnly?: boolean;
  onStatusChange?: (stageId: string, status: string) => void;
  onImageUpload?: (stageKey: string, file: File) => void;
  onApproveGate?: (stageId: string) => void;
  onRequestChangesGate?: (stageId: string) => void;
}

export function D3DPipelineBoard({
  stages,
  readOnly = false,
  onStatusChange,
  onImageUpload,
  onApproveGate,
  onRequestChangesGate,
}: D3DPipelineBoardProps) {
  const [drawer, setDrawer] = useState<{
    open: boolean;
    imageUrl: string | null;
    label: string;
    subtitle: string;
    index: number;
  }>({ open: false, imageUrl: null, label: "", subtitle: "", index: 0 });

  const stageMap = new Map(stages.map((s) => [s.stage_key, s]));

  const handleImageClick = useCallback(
    (stageKey: string, imageUrl: string) => {
      const config = D3D_STAGE_CONFIGS.find((c) => c.key === stageKey);
      if (!config) return;
      const idx = D3D_STAGE_CONFIGS.filter((c) => c.type === "phase").findIndex(
        (c) => c.key === stageKey
      );
      setDrawer({
        open: true,
        imageUrl,
        label: config.label,
        subtitle: config.subtitle,
        index: idx,
      });
    },
    []
  );

  let phaseIndex = 0;

  return (
    <>
      <div className="flex items-stretch gap-3">
        {D3D_STAGE_CONFIGS.map((config, configIdx) => {
          const state = stageMap.get(config.key);
          const needsConnector = configIdx > 0 && config.type === "phase" && D3D_STAGE_CONFIGS[configIdx - 1]?.type !== "gate";

          if (config.type === "gate") {
            return (
              <D3DGateNode
                key={config.key}
                config={config}
                state={state}
                readOnly={readOnly}
                onApprove={onApproveGate}
                onRequestChanges={onRequestChangesGate}
              />
            );
          }

          const currentPhaseIndex = phaseIndex;
          phaseIndex++;

          return (
            <div key={config.key} className="contents">
              {needsConnector && <D3DConnector />}
              <D3DStageCard
                config={config}
                state={state}
                index={currentPhaseIndex}
                readOnly={readOnly}
                onImageUpload={onImageUpload}
                onImageClick={handleImageClick}
                onStatusChange={onStatusChange}
              />
            </div>
          );
        })}
      </div>

      <D3DImageDrawer
        open={drawer.open}
        onClose={() => setDrawer((d) => ({ ...d, open: false }))}
        imageUrl={drawer.imageUrl}
        stageLabel={drawer.label}
        stageSubtitle={drawer.subtitle}
        stageIndex={drawer.index}
      />
    </>
  );
}
