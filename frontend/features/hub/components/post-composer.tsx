"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  IconPhoto,
  IconSend,
  IconX,
  IconHash,
} from "@tabler/icons-react";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { useCreateHubPost } from "../hooks/use-hub-posts";
import { uploadHubImage } from "../services/hub-upload";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { HubPostChannel } from "../services/hub-posts";

/* ─── Channel options ────────────────────────────────────────────── */

const CHANNELS: Array<{ value: HubPostChannel; label: string; color: string }> = [
  { value: "projetos", label: "Projetos", color: "#3b82f6" },
  { value: "comercial", label: "Comercial", color: "#c45a1a" },
  { value: "financeiro", label: "Financeiro", color: "#10b981" },
  { value: "pessoas", label: "Pessoas", color: "#8b5cf6" },
  { value: "cultura", label: "Cultura", color: "#f43f5e" },
  { value: "marketing", label: "Marketing", color: "#6366f1" },
];

/* ─── Design Tokens ──────────────────────────────────────────────── */

const T = {
  bg: "#f0ede9",
  text: "#0f0f0f",
  muted: "#4a4a4a",
  orange: "#c45a1a",
  orangeGlow: "rgba(196,90,26,0.10)",
  glass: "rgba(255,255,255,0.65)",
  glassBorder: "rgba(255,255,255,0.45)",
  glassShadow:
    "0 8px 32px rgba(15,15,15,0.06), 0 1px 3px rgba(15,15,15,0.04)",
  glassBlur: "blur(16px) saturate(180%)",
  r: "16px",
};

/* ─── Component ──────────────────────────────────────────────────── */

interface PostComposerProps {
  avatarUrl?: string;
  initials: string;
  fullName: string;
  role?: string;
}

export function PostComposer({
  avatarUrl,
  initials,
  fullName,
  role = "",
}: PostComposerProps) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState<(typeof CHANNELS)[number] | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [channelOpen, setChannelOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const createPost = useCreateHubPost();
  const tenantId = useAuthStore((s) => s.tenantId);

  /* ─── Image handling ─────────────────────────────────────────── */

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    },
    [],
  );

  /* ─── Publish ────────────────────────────────────────────────── */

  const handlePublish = useCallback(async () => {
    if (!body.trim() && !title.trim()) return;
    setPublishing(true);

    try {
      let coverUrl: string | undefined;
      if (imageFile && tenantId) {
        const supabase = createClient();
        coverUrl = await uploadHubImage(
          supabase as unknown as SupabaseClient<Database>,
          tenantId,
          imageFile,
        );
      }

      const ch = channel ?? CHANNELS[4]; // default: cultura
      await createPost.mutateAsync({
        title: title.trim() || undefined,
        body: body.trim(),
        channel: ch.value,
        cover_url: coverUrl,
      });

      setTitle("");
      setBody("");
      setChannel(null);
      setImagePreview(null);
      setImageFile(null);
      setExpanded(false);
    } finally {
      setPublishing(false);
    }
  }, [title, body, channel, imageFile, tenantId, createPost]);

  const reset = useCallback(() => {
    setExpanded(false);
    setTitle("");
    setBody("");
    setChannel(null);
    setImagePreview(null);
    setImageFile(null);
  }, []);

  /* ─── Collapsed state ────────────────────────────────────────── */

  if (!expanded) {
    return (
      <div
        className="p-5 cursor-pointer"
        style={{
          background: T.glass,
          backdropFilter: T.glassBlur,
          WebkitBackdropFilter: T.glassBlur,
          border: `1px solid ${T.glassBorder}`,
          borderRadius: T.r,
          boxShadow: T.glassShadow,
        }}
        onClick={() => setExpanded(true)}
      >
        <div className="flex items-center gap-3">
          <Avatar className="size-9 shrink-0">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback
              className="text-[10px] font-semibold"
              style={{ background: T.orangeGlow, color: T.orange }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div
            className="flex-1 px-4 py-2.5 text-xs rounded-full"
            style={{
              background: T.bg,
              border: `1px solid ${T.glassBorder}`,
              color: T.muted,
            }}
          >
            Compartilhar uma novidade...
          </div>
          <button
            className="size-9 flex items-center justify-center shrink-0 rounded-xl"
            style={{ background: "#e8e4df" }}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(true);
              setTimeout(() => fileRef.current?.click(), 100);
            }}
          >
            <IconPhoto className="size-4" style={{ color: T.muted }} />
          </button>
        </div>
      </div>
    );
  }

  /* ─── Expanded state ─────────────────────────────────────────── */

  return (
    <motion.div
      initial={{ opacity: 0, height: "auto" }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="overflow-hidden"
      style={{
        background: T.glass,
        backdropFilter: T.glassBlur,
        WebkitBackdropFilter: T.glassBlur,
        border: `1px solid ${T.glassBorder}`,
        borderRadius: T.r,
        boxShadow: T.glassShadow,
      }}
    >
      <div className="p-5">
        {/* Author row */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="size-8 shrink-0">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback
              className="text-[9px] font-semibold"
              style={{ background: T.orangeGlow, color: T.orange }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <span
              className="text-xs font-semibold block"
              style={{ color: T.text }}
            >
              {fullName}
            </span>
            <span className="text-[10px]" style={{ color: T.muted }}>
              {role}
            </span>
          </div>

          {/* Channel selector */}
          <Popover open={channelOpen} onOpenChange={setChannelOpen}>
            <PopoverTrigger asChild>
              <button
                className="ml-auto flex items-center gap-1 text-[11px] font-medium px-3 py-1.5 rounded-full transition-colors"
                style={{
                  background: channel
                    ? `${channel.color}15`
                    : T.orangeGlow,
                  color: channel ? channel.color : T.orange,
                  border: `1px solid ${channel ? `${channel.color}30` : "transparent"}`,
                }}
              >
                <IconHash className="size-3" />
                {channel?.label ?? "Canal"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-1" align="end">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.value}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs rounded-md hover:bg-accent transition-colors"
                  onClick={() => {
                    setChannel(ch);
                    setChannelOpen(false);
                  }}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ background: ch.color }}
                  />
                  {ch.label}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titulo (opcional)"
          className="w-full bg-transparent text-sm font-semibold placeholder:text-muted-foreground/40 focus:outline-none mb-2"
          style={{ color: T.text }}
        />

        {/* TipTap RichTextEditor */}
        <div className="min-h-[80px] [&_.ProseMirror]:min-h-[60px] [&_.ProseMirror]:text-[13px] [&_.ProseMirror]:leading-relaxed">
          <RichTextEditor
            content={body}
            onChange={setBody}
            placeholder="Escreva algo... Use @ para mencionar alguem"
            minimal
            toolbar={false}
            onSubmit={handlePublish}
          />
        </div>

        {/* Image preview */}
        <AnimatePresence>
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="relative mt-2 rounded-xl overflow-hidden"
            >
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-48 object-cover rounded-xl"
              />
              <button
                className="absolute top-2 right-2 size-6 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                }}
              >
                <IconX className="size-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toolbar */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
          <div className="flex items-center gap-1">
            <button
              className="size-8 flex items-center justify-center rounded-lg hover:bg-black/[0.04] transition-colors"
              title="Imagem"
              onClick={() => fileRef.current?.click()}
            >
              <IconPhoto className="size-4" style={{ color: T.muted }} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8"
              onClick={reset}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="text-xs h-8 gap-1"
              style={{ background: T.orange }}
              disabled={(!title.trim() && !body.trim()) || publishing}
              onClick={handlePublish}
            >
              <IconSend className="size-3.5" />
              {publishing ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />
    </motion.div>
  );
}
