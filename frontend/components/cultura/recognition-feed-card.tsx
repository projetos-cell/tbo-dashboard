"use client";

import { Heart, ThumbsUp, Trash2, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/tbo-ui/card";
import { Badge } from "@/components/tbo-ui/badge";
import { Button } from "@/components/tbo-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tbo-ui/dropdown-menu";
import { RECOGNITION_SOURCES } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type RecognitionRow = Database["public"]["Tables"]["recognitions"]["Row"];

interface RecognitionFeedCardProps {
  recognition: RecognitionRow;
  fromName?: string;
  toName?: string;
  onLike?: (id: string) => void;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
}

export function RecognitionFeedCard({
  recognition,
  fromName,
  toName,
  onLike,
  onDelete,
  canDelete,
}: RecognitionFeedCardProps) {
  const sourceInfo =
    RECOGNITION_SOURCES[recognition.source as keyof typeof RECOGNITION_SOURCES] ??
    RECOGNITION_SOURCES.manual;

  const timeAgo = formatTimeAgo(recognition.created_at ?? "");

  return (
    <Card className="border-l-4" style={{ borderLeftColor: "#22c55e" }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header: from → to */}
            <div className="flex items-center gap-1 text-sm flex-wrap">
              <span className="font-medium">{fromName || recognition.from_user}</span>
              <span className="text-gray-500">reconheceu</span>
              <span className="font-medium">{toName || recognition.to_user}</span>
            </div>

            {/* Value badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {recognition.value_emoji} {recognition.value_name}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs"
                style={{ color: sourceInfo.color }}
              >
                {sourceInfo.label}
              </Badge>
              {recognition.points && recognition.points > 1 && (
                <Badge variant="outline" className="text-xs text-amber-600">
                  +{recognition.points} pts
                </Badge>
              )}
            </div>

            {/* Message */}
            {recognition.message && (
              <p className="text-sm text-gray-500 line-clamp-3">
                &ldquo;{recognition.message}&rdquo;
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{timeAgo}</span>
              <button
                onClick={() => onLike?.(recognition.id)}
                className="flex items-center gap-1 hover:text-tbo-orange transition-colors"
              >
                <ThumbsUp className="size-3" />
                {recognition.likes ?? 0}
              </button>
            </div>
          </div>

          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-red-500"
                  onClick={() => onDelete?.(recognition.id)}
                >
                  <Trash2 className="size-3.5 mr-1.5" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("pt-BR");
}
