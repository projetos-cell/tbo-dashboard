"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconAlertTriangle,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconSpeakerphone,
  IconUrgent,
} from "@tabler/icons-react";
import {
  useUnreadAnnouncements,
  useMarkAnnouncementRead,
} from "@/features/hub/hooks/use-announcements";
import type { AnnouncementRow } from "@/features/hub/services/announcements";

/* ─── Design Tokens ──────────────────────────────────────── */

const T = {
  text: "#0f0f0f",
  muted: "#4a4a4a",
  orange: "#c45a1a",
  glass: "rgba(255,255,255,0.65)",
  glassBorder: "rgba(255,255,255,0.45)",
  glassShadow:
    "0 8px 32px rgba(15,15,15,0.06), 0 1px 3px rgba(15,15,15,0.04)",
  glassBlur: "blur(16px) saturate(180%)",
  r: "16px",
};

const PRIORITY_CONFIG = {
  normal: {
    bg: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    icon: IconSpeakerphone,
    label: "Comunicado",
  },
  important: {
    bg: "linear-gradient(135deg, #c45a1a 0%, #aa4d17 100%)",
    icon: IconAlertTriangle,
    label: "Importante",
  },
  urgent: {
    bg: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
    icon: IconUrgent,
    label: "Urgente",
  },
} as const;

/* ─── Time Ago Helper ────────────────────────────────────── */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

/* ─── Single Announcement Card ───────────────────────────── */

function AnnouncementCard({
  announcement,
  onConfirmRead,
  isConfirming,
}: {
  announcement: AnnouncementRow;
  onConfirmRead: () => void;
  isConfirming: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = PRIORITY_CONFIG[announcement.priority];
  const Icon = config.icon;

  const bodyPreview =
    announcement.body.replace(/<[^>]*>/g, "").slice(0, 120);
  const hasMore = announcement.body.replace(/<[^>]*>/g, "").length > 120;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
      style={{
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(15,15,15,0.08)",
      }}
    >
      {/* Header bar */}
      <div
        className="flex items-center gap-2.5 px-4 py-2.5"
        style={{ background: config.bg }}
      >
        <Icon className="size-4 text-white shrink-0" />
        <span className="text-[11px] font-bold text-white uppercase tracking-wider">
          {config.label}
        </span>
        {announcement.pinned && (
          <span className="text-[9px] font-bold text-white/60 uppercase ml-auto">
            Fixado
          </span>
        )}
      </div>

      {/* Content */}
      <div
        className="px-4 py-3"
        style={{
          background: T.glass,
          backdropFilter: T.glassBlur,
          WebkitBackdropFilter: T.glassBlur,
          borderLeft: `1px solid ${T.glassBorder}`,
          borderRight: `1px solid ${T.glassBorder}`,
          borderBottom: `1px solid ${T.glassBorder}`,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4
              className="text-sm font-semibold leading-snug"
              style={{ color: T.text }}
            >
              {announcement.title}
            </h4>

            <div className="flex items-center gap-2 mt-1">
              {announcement.author_avatar_url ? (
                <img
                  src={announcement.author_avatar_url}
                  alt=""
                  className="size-4 rounded-full object-cover"
                />
              ) : (
                <div
                  className="size-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                  style={{
                    background: "rgba(196,90,26,0.1)",
                    color: T.orange,
                  }}
                >
                  {announcement.author_full_name?.charAt(0) ?? "?"}
                </div>
              )}
              <span className="text-[11px]" style={{ color: T.muted }}>
                {announcement.author_full_name ?? "Autor"} ·{" "}
                {timeAgo(announcement.published_at ?? announcement.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="mt-2.5">
          {expanded ? (
            <div
              className="text-xs leading-relaxed prose-sm max-w-none"
              style={{ color: T.text }}
              dangerouslySetInnerHTML={{ __html: announcement.body }}
            />
          ) : (
            <p className="text-xs leading-relaxed" style={{ color: T.muted }}>
              {bodyPreview}
              {hasMore && "..."}
            </p>
          )}

          {hasMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 mt-1.5 text-[11px] font-medium transition-colors hover:opacity-80"
              style={{ color: T.orange }}
            >
              {expanded ? (
                <>
                  Menos <IconChevronUp className="size-3" />
                </>
              ) : (
                <>
                  Ler mais <IconChevronDown className="size-3" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Read confirmation */}
        {announcement.requires_read_confirmation && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: "rgba(15,15,15,0.06)" }}>
            <button
              onClick={onConfirmRead}
              disabled={isConfirming}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{
                background: "rgba(196,90,26,0.08)",
                color: T.orange,
              }}
            >
              <IconCheck className="size-3.5" />
              {isConfirming ? "Confirmando..." : "Confirmar leitura"}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */

export function AnnouncementBanner() {
  const { data: unread = [], isLoading } = useUnreadAnnouncements();
  const markRead = useMarkAnnouncementRead();

  if (isLoading || unread.length === 0) return null;

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {unread.map((ann) => (
          <AnnouncementCard
            key={ann.id}
            announcement={ann}
            onConfirmRead={() => markRead.mutate(ann.id)}
            isConfirming={
              markRead.isPending && markRead.variables === ann.id
            }
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── Announcements Feed (all, for full view) ────────────── */

export function AnnouncementsFeed() {
  const { data: unread = [] } = useUnreadAnnouncements();
  const markRead = useMarkAnnouncementRead();

  if (unread.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <IconSpeakerphone className="size-4" style={{ color: T.orange }} />
        <h3 className="text-sm font-semibold" style={{ color: T.text }}>
          Comunicados pendentes
        </h3>
        <span
          className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{
            background: "rgba(196,90,26,0.1)",
            color: T.orange,
          }}
        >
          {unread.length}
        </span>
      </div>
      <AnimatePresence mode="popLayout">
        {unread.map((ann) => (
          <AnnouncementCard
            key={ann.id}
            announcement={ann}
            onConfirmRead={() => markRead.mutate(ann.id)}
            isConfirming={
              markRead.isPending && markRead.variables === ann.id
            }
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
