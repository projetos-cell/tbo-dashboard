"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { IconPhoto, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { SCENE_TYPE_CONFIG } from "@/features/review/constants";
import type { ReviewScene, ReviewVersion, SharePermission } from "@/features/review/types";

interface ShareViewerClientProps {
  scenes: ReviewScene[];
  versionsMap: Record<string, ReviewVersion[]>;
  permissions: SharePermission;
  token: string;
}

export function ShareViewerClient({
  scenes,
  versionsMap,
  permissions: _permissions,
  token: _token,
}: ShareViewerClientProps) {
  const [selectedSceneId, setSelectedSceneId] = useState<string>(scenes[0]?.id ?? "");
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  const selectedScene = scenes.find((s) => s.id === selectedSceneId) ?? scenes[0];
  const sceneVersions = selectedScene ? (versionsMap[selectedScene.id] ?? []) : [];
  const latestVersion = sceneVersions.length > 0 ? sceneVersions[sceneVersions.length - 1] : null;
  const activeVersion = sceneVersions.find((v) => v.id === selectedVersionId) ?? latestVersion;

  const currentSceneIndex = scenes.findIndex((s) => s.id === selectedSceneId);

  const goToScene = (scene: ReviewScene) => {
    setSelectedSceneId(scene.id);
    setSelectedVersionId(null); // Reset to latest
  };

  const goToPrevScene = () => {
    if (currentSceneIndex > 0) goToScene(scenes[currentSceneIndex - 1]!);
  };

  const goToNextScene = () => {
    if (currentSceneIndex < scenes.length - 1) goToScene(scenes[currentSceneIndex + 1]!);
  };

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Scene list sidebar */}
      <aside className="w-56 border-r flex flex-col bg-muted/20 shrink-0">
        <div className="px-3 py-2 border-b">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Cenas ({scenes.length})
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {scenes.map((scene, idx) => {
              const versions = versionsMap[scene.id] ?? [];
              const latest = versions[versions.length - 1];
              const isSelected = scene.id === selectedSceneId;
              const sceneConfig = SCENE_TYPE_CONFIG[scene.scene_type];

              return (
                <button
                  key={scene.id}
                  onClick={() => goToScene(scene)}
                  className={`w-full text-left rounded-lg overflow-hidden border transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-transparent hover:border-border hover:bg-muted/50"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-muted relative">
                    {latest?.file_url ? (
                      <img
                        src={latest.thumbnail_url ?? latest.file_url}
                        alt={scene.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IconPhoto className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="absolute top-1 left-1">
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1 py-0 bg-black/50 text-white border-0"
                      >
                        {idx + 1}
                      </Badge>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-medium truncate leading-tight">{scene.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {sceneConfig.label} · {versions.length} versão{versions.length !== 1 ? "ões" : ""}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </aside>

      {/* Main viewer area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Version toolbar */}
        {sceneVersions.length > 0 && (
          <div className="border-b px-4 py-2 flex items-center gap-3 bg-card shrink-0">
            <span className="text-xs text-muted-foreground font-medium">Versão:</span>
            <div className="flex items-center gap-1">
              {sceneVersions.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVersionId(v.id)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    (activeVersion?.id === v.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  {v.version_label}
                </button>
              ))}
            </div>
            {selectedScene && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-xs font-medium">{selectedScene.name}</span>
              </>
            )}
          </div>
        )}

        {/* Image viewer */}
        <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-4 relative min-h-0">
          {activeVersion?.file_url ? (
            <div className="relative max-w-full max-h-full">
              <img
                src={activeVersion.file_url}
                alt={`${selectedScene?.name ?? ""} — ${activeVersion.version_label}`}
                className="max-w-full max-h-[calc(100vh-220px)] object-contain rounded-lg shadow-lg"
              />
            </div>
          ) : (
            <div className="text-center space-y-2">
              <IconPhoto className="h-12 w-12 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground">
                Nenhuma imagem disponível para esta cena.
              </p>
            </div>
          )}

          {/* Scene navigation arrows */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 shadow"
              onClick={goToPrevScene}
              disabled={currentSceneIndex === 0}
            >
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs bg-background/90 backdrop-blur px-2 py-1 rounded-full shadow text-muted-foreground">
              {currentSceneIndex + 1} / {scenes.length}
            </span>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 shadow"
              onClick={goToNextScene}
              disabled={currentSceneIndex === scenes.length - 1}
            >
              <IconChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Footer info */}
        {activeVersion && (
          <div className="border-t px-4 py-2 flex items-center justify-between bg-card shrink-0">
            <span className="text-xs text-muted-foreground">
              Versão: <span className="font-medium text-foreground">{activeVersion.version_label}</span>
            </span>
            {activeVersion.uploaded_by_name && (
              <span className="text-xs text-muted-foreground">
                Enviado por: <span className="font-medium text-foreground">{activeVersion.uploaded_by_name}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
