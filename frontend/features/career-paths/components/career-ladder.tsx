"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronRight, CheckCircle2, Circle, Star, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CareerLevelDetailSheet } from "./career-level-detail";
import type { CareerPathWithTracks, CareerLevel } from "@/features/career-paths/services/career-paths";
import { TRACK_TYPE_META } from "@/features/career-paths/utils/career-constants";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" as const } },
};

interface CareerLadderProps {
  careerPath: CareerPathWithTracks;
  currentLevelId?: string | null;
}

export function CareerLadder({ careerPath, currentLevelId }: CareerLadderProps) {
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);

  const baseTrack = careerPath.career_tracks.find((t) => t.track_type === "base");
  const gestaoTrack = careerPath.career_tracks.find((t) => t.track_type === "gestao");
  const tecnicaTrack = careerPath.career_tracks.find((t) => t.track_type === "tecnica");

  const allLevels = [
    ...(baseTrack?.career_levels ?? []),
    ...(gestaoTrack?.career_levels ?? []),
    ...(tecnicaTrack?.career_levels ?? []),
  ];

  function getLevelStatus(level: CareerLevel): "passed" | "current" | "future" {
    if (!currentLevelId) return "future";
    if (level.id === currentLevelId) return "current";

    const currentLevel = allLevels.find((l) => l.id === currentLevelId);
    if (!currentLevel) return "future";

    if (level.track_id === currentLevel.track_id) {
      return level.order_index < currentLevel.order_index ? "passed" : "future";
    }

    if (level.track_id === baseTrack?.id) {
      const poLevel = baseTrack.career_levels.find((l) => l.is_transition_point);
      if (poLevel && level.order_index <= poLevel.order_index) return "passed";
    }

    return "future";
  }

  const selectedLevelWithComps = selectedLevelId
    ? allLevels.find((l) => l.id === selectedLevelId) ?? null
    : null;

  return (
    <div className="space-y-2">
      {/* Trilha Base */}
      {baseTrack && (
        <div className="space-y-1.5">
          <TrackLabel track={baseTrack} />
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="relative space-y-1"
          >
            {/* Linha conectora vertical */}
            <div className="absolute left-[21px] top-3 bottom-3 w-px bg-gray-200" />

            {baseTrack.career_levels.map((level, idx) => (
              <motion.div key={level.id} variants={fadeUp} className="relative">
                <LadderItem
                  level={level}
                  status={getLevelStatus(level)}
                  isLast={idx === baseTrack.career_levels.length - 1}
                  onClick={() => setSelectedLevelId(level.id)}
                  isTransitionPoint={level.is_transition_point}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Bifurcação */}
      {(gestaoTrack || tecnicaTrack) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.25 }}
          className="flex items-center gap-2 py-2 pl-3"
        >
          <div className="flex items-center gap-2 rounded-full border border-dashed border-gray-300 bg-muted/40 px-3 py-1">
            <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Escolha sua trilha</span>
          </div>
          <div className="flex-1 border-t border-dashed border-gray-200" />
        </motion.div>
      )}

      {/* Trilhas Gestão + Técnica lado a lado */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {gestaoTrack && (
          <div className="space-y-1.5">
            <TrackLabel track={gestaoTrack} />
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="relative space-y-1"
            >
              <div className="absolute left-[21px] top-3 bottom-3 w-px bg-blue-200" />
              {gestaoTrack.career_levels.map((level, idx) => (
                <motion.div key={level.id} variants={fadeUp} className="relative">
                  <LadderItem
                    level={level}
                    status={getLevelStatus(level)}
                    isLast={idx === gestaoTrack.career_levels.length - 1}
                    onClick={() => setSelectedLevelId(level.id)}
                    trackColor="blue"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {tecnicaTrack && (
          <div className="space-y-1.5">
            <TrackLabel track={tecnicaTrack} />
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="relative space-y-1"
            >
              <div className="absolute left-[21px] top-3 bottom-3 w-px bg-orange-200" />
              {tecnicaTrack.career_levels.map((level, idx) => (
                <motion.div key={level.id} variants={fadeUp} className="relative">
                  <LadderItem
                    level={level}
                    status={getLevelStatus(level)}
                    isLast={idx === tecnicaTrack.career_levels.length - 1}
                    onClick={() => setSelectedLevelId(level.id)}
                    trackColor="orange"
                  />
                </motion.div>
              ))}
            </motion.div>
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
  trackColor,
}: {
  level: CareerLevel;
  status: "passed" | "current" | "future";
  isLast: boolean;
  onClick: () => void;
  isTransitionPoint?: boolean;
  trackColor?: "blue" | "orange";
}) {
  const focusRing = trackColor === "blue"
    ? "focus-visible:ring-blue-400"
    : trackColor === "orange"
      ? "focus-visible:ring-orange-400"
      : "focus-visible:ring-orange-400";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all",
        "hover:shadow-sm active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        focusRing,
        status === "current" && "border-orange-400 bg-orange-50 shadow-sm hover:border-orange-500",
        status === "passed" && "border-gray-200 bg-gray-50/60 opacity-75 hover:opacity-100 hover:border-gray-300",
        status === "future" && "border-gray-200 bg-card hover:border-orange-200",
        isTransitionPoint && "border-dashed border-gray-400",
      )}
    >
      {/* Ícone de status */}
      <span className="shrink-0 relative z-10 bg-white rounded-full">
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
            Topo
          </Badge>
        )}
      </span>

      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
