"use client";

import { useMemo, useState } from "react";
import { Search, MessageSquare } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useMeetingTranscription } from "@/hooks/use-meetings";

// ─── Helpers ─────────────────────────────────────────────────────────

/** Derive initials from speaker name (up to 2 chars) */
function initials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Deterministic color for a speaker name */
const SPEAKER_COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-purple-600",
  "bg-orange-600",
  "bg-pink-600",
  "bg-teal-600",
  "bg-indigo-600",
  "bg-rose-600",
];

function speakerColor(name: string | null): string {
  if (!name) return SPEAKER_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SPEAKER_COLORS[Math.abs(hash) % SPEAKER_COLORS.length];
}

/** Format seconds to mm:ss */
function formatTimestamp(seconds: number | null): string | null {
  if (seconds == null || seconds < 0) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Transcript line type ────────────────────────────────────────────

interface TranscriptLine {
  id: string;
  speaker_name: string | null;
  speaker_email: string | null;
  text: string;
  start_time: number | null;
  end_time: number | null;
  raw_index: number | null;
}

// ─── Loading skeleton ────────────────────────────────────────────────

function TranscriptSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="bg-muted rounded-full p-3">
        <MessageSquare className="text-muted-foreground size-6" />
      </div>
      <div>
        <p className="font-medium">Nenhuma transcricao disponivel</p>
        <p className="text-muted-foreground text-sm">
          Esta reuniao ainda nao possui transcricao sincronizada.
        </p>
      </div>
    </div>
  );
}

// ─── Transcript line component ───────────────────────────────────────

function TranscriptLineItem({ line }: { line: TranscriptLine }) {
  const ts = formatTimestamp(line.start_time);
  const color = speakerColor(line.speaker_name);

  return (
    <div className="flex gap-3 px-1 py-2">
      <Avatar size="sm" className="mt-0.5 shrink-0">
        <AvatarFallback className={`${color} text-white text-[10px]`}>
          {initials(line.speaker_name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">
            {line.speaker_name ?? "Desconhecido"}
          </span>
          {ts && (
            <span className="text-muted-foreground text-[10px] tabular-nums">
              {ts}
            </span>
          )}
        </div>
        <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">
          {line.text}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

interface MeetingTranscriptViewerProps {
  meetingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MeetingTranscriptViewer({
  meetingId,
  open,
  onOpenChange,
}: MeetingTranscriptViewerProps) {
  const { data: lines, isLoading } = useMeetingTranscription(meetingId);
  const [search, setSearch] = useState("");

  const filteredLines = useMemo(() => {
    if (!lines || lines.length === 0) return [];
    const term = search.toLowerCase().trim();
    if (!term) return lines as unknown as TranscriptLine[];

    return (lines as unknown as TranscriptLine[]).filter(
      (l) =>
        l.text?.toLowerCase().includes(term) ||
        l.speaker_name?.toLowerCase().includes(term)
    );
  }, [lines, search]);

  const lineCount = lines?.length ?? 0;
  const filteredCount = filteredLines.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="size-5" />
            Transcricao da Reuniao
          </DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar na transcricao..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && lineCount > 0 && (
            <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs">
              {filteredCount} de {lineCount}
            </span>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <TranscriptSkeleton />
        ) : !lines || lines.length === 0 ? (
          <EmptyState />
        ) : filteredLines.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground text-sm">
              Nenhum resultado para &quot;{search}&quot;.
            </p>
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-2" style={{ maxHeight: "60vh" }}>
            <div className="divide-y">
              {filteredLines.map((line) => (
                <TranscriptLineItem key={line.id} line={line} />
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
