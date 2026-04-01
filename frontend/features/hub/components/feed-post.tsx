"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  IconBookmark,
  IconCalendar,
  IconDots,
  IconExternalLink,
  IconMessage,
  IconThumbUp,
  IconTrash,
} from "@tabler/icons-react";
import { useAuthStore } from "@/stores/auth-store";
import { useToggleHubLike } from "../hooks/use-hub-like";
import { useDeleteHubPost } from "../hooks/use-hub-posts";
import { useHubComments, useAddHubComment } from "../hooks/use-hub-comments";
import type { HubPostRow } from "../services/hub-posts";

/* ─── Design Tokens ────────────────────────────────────────────── */

const T = {
  text: "#0f0f0f",
  muted: "#4a4a4a",
  orange: "#c45a1a",
  orangeGlow: "rgba(196,90,26,0.10)",
  bgAlt: "#e8e4df",
  borderSolid: "#e0dcd7",
  glass: "rgba(255,255,255,0.65)",
  glassBorder: "rgba(255,255,255,0.45)",
  glassShadow:
    "0 8px 32px rgba(15,15,15,0.06), 0 1px 3px rgba(15,15,15,0.04)",
  glassBlur: "blur(16px) saturate(180%)",
  r: "16px",
};

const CHANNEL_COLORS: Record<string, string> = {
  projetos: "#3b82f6",
  comercial: "#c45a1a",
  financeiro: "#10b981",
  pessoas: "#8b5cf6",
  cultura: "#f43f5e",
  marketing: "#6366f1",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

interface FeedPostProps {
  post: HubPostRow;
  userLiked: boolean;
}

export function FeedPost({ post, userLiked }: FeedPostProps) {
  const user = useAuthStore((s) => s.user);
  const toggleLike = useToggleHubLike();
  const deletePost = useDeleteHubPost();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { data: comments = [] } = useHubComments(showComments ? post.id : null);
  const addComment = useAddHubComment();
  const channelColor = CHANNEL_COLORS[post.channel] ?? T.muted;
  const isOwner = user?.id === post.author_id;

  function handleLike() {
    toggleLike.mutate({ postId: post.id, isLiked: userLiked });
  }

  function handleDelete() {
    deletePost.mutate(post.id);
  }

  function handleComment() {
    if (!commentText.trim()) return;
    addComment.mutate(
      { post_id: post.id, content: commentText.trim() },
      { onSuccess: () => setCommentText("") }
    );
  }

  return (
    <div
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
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <IconCalendar className="size-3.5" style={{ color: T.muted }} />
          <span className="text-[11px]" style={{ color: T.muted }}>
            {timeAgo(post.created_at)} em{" "}
            <span className="font-semibold" style={{ color: channelColor }}>
              {post.channel}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {post.is_pinned && (
            <IconBookmark
              className="size-4"
              style={{ color: T.orange }}
              fill={T.orange}
            />
          )}
          {isOwner && (
            <button
              onClick={handleDelete}
              className="p-1 rounded hover:bg-red-50 transition-colors"
            >
              <IconTrash className="size-3.5 text-red-400" />
            </button>
          )}
          <IconDots className="size-3.5" style={{ color: T.muted }} />
        </div>
      </div>

      {/* Cover */}
      {post.cover_url && (
        <div className="mx-4 rounded-xl overflow-hidden">
          <img
            src={post.cover_url}
            alt=""
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="px-5 py-4">
        {post.title && (
          <h3
            className="text-base font-semibold leading-snug mb-2"
            style={{ color: T.text, letterSpacing: "-0.01em" }}
          >
            {post.title}
          </h3>
        )}
        <div
          className="text-[13px] leading-relaxed prose prose-sm max-w-none"
          style={{ color: T.muted }}
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {/* Author + actions */}
        <div
          className="flex items-center justify-between mt-4 pt-3 border-t"
          style={{ borderColor: T.borderSolid }}
        >
          <div className="flex items-center gap-2">
            <Avatar className="size-7">
              {post.author_avatar_url && (
                <AvatarImage src={post.author_avatar_url} />
              )}
              <AvatarFallback
                className="text-[9px] font-semibold"
                style={{ background: T.bgAlt, color: T.muted }}
              >
                {initials(post.author_full_name ?? "U")}
              </AvatarFallback>
            </Avatar>
            <div>
              <span
                className="text-xs font-semibold block"
                style={{ color: T.text }}
              >
                {post.author_full_name}
              </span>
              {post.author_role && (
                <span className="text-[10px]" style={{ color: T.muted }}>
                  {post.author_role}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowComments((s) => !s)}
              className="flex items-center gap-1 text-xs transition-colors hover:opacity-70"
              style={{ color: T.muted }}
            >
              <IconMessage className="size-3.5" /> {post.comments_count}
            </button>
            <button
              onClick={handleLike}
              className="flex items-center gap-1 text-xs transition-colors hover:opacity-70"
              style={{ color: userLiked ? T.orange : T.muted }}
            >
              <IconThumbUp
                className="size-3.5"
                fill={userLiked ? T.orange : "none"}
              />{" "}
              {post.likes_count}
            </button>
          </div>
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="border-t px-5 py-3 space-y-3"
          style={{
            borderColor: T.glassBorder,
            background: "rgba(240,237,233,0.5)",
          }}
        >
          {/* Comment input */}
          <div className="flex items-center gap-2">
            <Avatar className="size-6 shrink-0">
              <AvatarFallback
                className="text-[8px] font-semibold"
                style={{ background: T.orangeGlow, color: T.orange }}
              >
                {user?.user_metadata?.full_name
                  ? initials(user.user_metadata.full_name as string)
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleComment();
                }
              }}
              placeholder="Adicionar comentario..."
              className="flex-1 text-xs bg-transparent outline-none placeholder:text-gray-400"
              style={{ color: T.text }}
            />
            {commentText.trim() && (
              <button
                onClick={handleComment}
                className="text-[11px] font-semibold"
                style={{ color: T.orange }}
              >
                Enviar
              </button>
            )}
          </div>

          {/* Existing comments */}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <Avatar className="size-6 shrink-0 mt-0.5">
                {c.author_avatar_url && (
                  <AvatarImage src={c.author_avatar_url} />
                )}
                <AvatarFallback
                  className="text-[8px] font-semibold"
                  style={{ background: T.bgAlt, color: T.muted }}
                >
                  {initials(c.author_full_name ?? "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: T.text }}
                  >
                    {c.author_full_name}
                  </span>
                  <span className="text-[10px]" style={{ color: T.muted }}>
                    {timeAgo(c.created_at)}
                  </span>
                </div>
                <p
                  className="text-[12px] leading-relaxed mt-0.5"
                  style={{ color: T.muted }}
                >
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
