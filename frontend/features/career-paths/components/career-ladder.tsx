"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, CheckCircle2, Circle, Star, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CareerLevelDetailSheet } from "./career-level-detail";
import type { CareerPathWithTracks, CareerLevel } from "@/features/career-paths/services/career-paths";
import { TRACK_TYPE_META } from "@/features/career-paths/utils/career-constants";

interface CareerLadderProps {
  careerPath: CareerPathWithTracks;
  /** ID do nível atual da pessoa (se estiver visualizando uma pessoa específica) */
  currentLevelId?: string | null;
}

export function CareerLadder({ careerPath, currentLevelId }: CareerLadderProps) {
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);

  const baseTrack = careerPath.career_tracks.find((t) => t.track_type === "base");
  const gestaoTrack = careerPath.career_tracks.find((t) => t.track_type === "gestao");
  const tecnicaTrack = careerPath.career_tracks.find((t) => t.track_type === "tecnica");

  // Determina quais níveis já foram passados (se houver pessoa com nível atual)
  function getLevelStatus(level: CareerLevel): "passed" | "current" | "future" {
    if (!currentLevelId) return "future";
    if (level.id === currentLevelId) return "current";

    // Para base track: passed se order_index < current
    const currentLevel = [
      ...(baseTrack?.career_levels ?? []),
      ...(gestaoTrack?.career_levels ?? []),
      ...(tecnicaTrack?.career_levels ?? []),
    ].find((l) => l.id === currentLevelId);

    if (!currentLevel) return "future";

    // Mesmo track: compara order_index
    if (level.track_id === currentLevel.track_id) {
      return level.order_index < currentLevel.order_index ? "passed" : "future";
    }

    // Base track: todos abaixo do PO são passados
    if (level.track_id === baseTrack?.id) {
      const poLevel = baseTrack.career_levels.find((l) => l.is_transition_point);
      if (poLevel && level.order_index <= (poLevel?.order_index ?? 0)) return "passed";
    }

    return "future";
  }

  const selectedLevel = selectedLevelId
    ? [
        ...(baseTrack?.career_levels ?? []),
        ...(gestaoTrack?.career_levels ?? []),
        ...(tecnicaTrack?.career_levels ?? []),
      ].find((l) => l.id === selectedLevelId) ?? null
    : null;

  // Encontra competências do nível selecionado
  const selectedLevelWithComps = selectedLevelId
    ? [
        ...(baseTrack?.career_levels ?? []),
        ...(gestaoTrack?.career_levels ?? []),
        ...(tecnicaTrack?.career_levels ?? []),
      ].find((l) => l.id === selectedLevelId) ?? null
    : null;

  return (
    <div className="space-y-2">
      {/* Trilha Base */}
      {baseTrack && (
        <div className="space-y-1.5">
          <TrackLabel track={baseTrack} />
          <div className="space-y-1">
            {baseTrack.career_levels.map((level, idx) => (
              <LadderItem
                key={level.id}
                level={level}
                status={getLevelStatus(level)}
                isLast={idx === baseTrack.career_levels.length - 1}
                onClick={() => setSelectedLevelId(level.id)}
                isTransitionPoint={level.is_transition_point}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bifurcação */}
      {(gestaoTrack || tecnicaTrack) && (
        <div className="flex items-center gap-2 py-1 pl-3">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">Escolha sua trilha</span>
        </div>
      )}

      {/* Trilhas Gestão + Técnica lado a lado */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {gestaoTrack && (
          <div className="space-y-1.5">
            <TrackLabel track={gestaoTrack} />
            <div className="space-y-1">
              {gestaoTrack.career_levels.map((level, idx) => (
                <LadderItem
                  key={level.id}
                  level={level}
                  status={getLevelStatus(level)}
                  isLast={idx === gestaoTrack.career_levels.length - 1}
                  onClick={() => setSelectedLevelId(level.id)}
                />
              ))}
            </div>
          </div>
        )}

        {tecnicaTrack && (
          <div className="space-y-1.5">
            <TrackLabel track={tecnicaTrack} />
            <div className="space-y-1">
              {tecnicaTrack.career_levels.map((level, idx) => (
                <LadderItem
                  key={level.id}
                  level={level}
                  status={getLevelStatus(level)}
                  isLast={idx === tecnicaTrack.career_levels.length - 1}
                  onClick={() => setSelectedLevelId(level.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sheet de detalhes do nível */}
      <CareerLevelDetailSheet
        level={selectedLevelWithComps}
        open={!!selectedLevelId}
        onOpenChange={(open) => !open && setSelectedLevelId(null)}
      />
    </div>
  );
}

function TrackLabel({ track }: { track: { track_type: string; name: string } }) {
  const meta = TRACK_TYPE_META[track.track_type as keyof typeof TRACK_TYPE_META];
  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-2 w-2 rounded-full", meta?.dot ?? "bg-gray-400")} />
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {track.name}
      </span>
    </div>
  );
}

function LadderItem({
  level,
  status,
  isLast,
  onClick,
  isTransitionPoint,
}: {
  level: CareerLevel;
  status: "passed" | "current" | "future";
  isLast: boolean;
  onClick: () => void;
  isTransitionPoint?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all",
        "hover:shadow-sm hover:border-orange-200",
        status === "current" && "border-orange-400 bg-orange-50 shadow-sm",
        status === "passed" && "border-gray-200 bg-gray-50/60 opacity-75",
        status === "future" && "border-gray-200 bg-card",
        isTransitionPoint && "border-dashed border-gray-400",
      )}
    >
      {/* Ícone de status */}
      <span className="shrink-0">
        {status === "passed" ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : status === "current" ? (
          <Star className="h-4 w-4 text-orange-500 fill-orange-500" />
        ) : (
          <Circle className="h-4 w-4 text-gray-300" />
        )}
      </span>

      {/* Nome do nível */}
      <span
        className={cn(
          "flex-1 text-sm",
          status === "current" && "font-semibold text-orange-700",
          status === "passed" && "text-muted-foreground",
          status === "future" && "text-foreground",
        )}
      >
        {level.name}
        {isTransitionPoint && (
          <Badge variant="outline" className="ml-2 text-[10px] py-0">
            Ponto de escolha
          </Badge>
        )}
        {isLast && (
          <Badge variant="outline" className="ml-2 text-[10px] py-0 border-yellow-400 text-yellow-600">
            ⭐ Topo
          </Badge>
        )}
      </span>

      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
    </button>
  );
}
