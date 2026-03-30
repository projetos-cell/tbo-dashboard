"use client";

import { useState, useEffect, useCallback } from "react";
import {
  IconSend,
  IconMessageCircle,
  IconRefresh,
  IconUser,
} from "@tabler/icons-react";

interface PortalComment {
  id: string;
  author_name: string;
  author_email: string;
  content: string;
  created_at: string;
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min atras`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atras`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d atras`;
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

interface PortalFeedbackProps {
  token: string;
  projectId: string;
}

export function PortalFeedback({ token, projectId }: PortalFeedbackProps) {
  const [comments, setComments] = useState<PortalComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Restore author info from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`portal_author_${projectId}`);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          name?: string;
          email?: string;
        };
        if (parsed.name) setAuthorName(parsed.name);
        if (parsed.email) setAuthorEmail(parsed.email);
      }
    } catch {
      // ignore
    }
  }, [projectId]);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/portal/comments?token=${token}`);
      if (!res.ok) throw new Error("Erro ao carregar");
      const data = (await res.json()) as { comments: PortalComment[] };
      setComments(data.comments);
    } catch {
      setError("Nao foi possivel carregar os comentarios");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleSubmit() {
    const trimmedContent = content.trim();
    const trimmedName = authorName.trim();
    if (!trimmedContent || !trimmedName) return;

    setSubmitting(true);
    try {
      // Save author info
      localStorage.setItem(
        `portal_author_${projectId}`,
        JSON.stringify({ name: trimmedName, email: authorEmail.trim() }),
      );

      const res = await fetch("/api/portal/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          author_name: trimmedName,
          author_email: authorEmail.trim() || undefined,
          content: trimmedContent,
        }),
      });

      if (!res.ok) throw new Error("Erro ao enviar");

      const data = (await res.json()) as { comment: PortalComment };
      setComments((prev) => [...prev, data.comment]);
      setContent("");
    } catch {
      setError("Erro ao enviar comentario. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-lg bg-[#e5e7eb]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Comments list */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <button
            onClick={() => fetchComments()}
            className="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:underline"
          >
            <IconRefresh className="size-3" />
            Tentar novamente
          </button>
        </div>
      )}

      {comments.length === 0 && !error ? (
        <div className="rounded-xl border border-dashed border-[#d1d5db] bg-white p-8 text-center">
          <IconMessageCircle className="mx-auto mb-2 size-8 text-[#9ca3af]" />
          <p className="text-sm font-medium text-[#4a5f7a]">
            Nenhum comentario ainda
          </p>
          <p className="mt-1 text-xs text-[#9ca3af]">
            Seja o primeiro a deixar seu feedback sobre o projeto.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-[#e5e7eb] bg-white p-3 transition-colors hover:bg-[#fafafa]"
            >
              <div className="flex items-center gap-2">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f0f0f0]">
                  <IconUser className="size-3 text-[#9ca3af]" />
                </div>
                <span className="text-sm font-medium text-[#1a1a2e]">
                  {comment.author_name}
                </span>
                <span className="text-xs text-[#9ca3af]">
                  {formatRelative(comment.created_at)}
                </span>
              </div>
              <p className="mt-1.5 pl-8 text-sm text-[#4a5f7a] whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <h4 className="mb-3 text-sm font-semibold text-[#1a1a2e]">
          Deixe seu feedback
        </h4>

        <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Seu nome *"
            className="rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#374151] placeholder:text-[#9ca3af] focus:border-[#e85102] focus:outline-none focus:ring-1 focus:ring-[#e85102]"
          />
          <input
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            placeholder="Seu email (opcional)"
            className="rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#374151] placeholder:text-[#9ca3af] focus:border-[#e85102] focus:outline-none focus:ring-1 focus:ring-[#e85102]"
          />
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva seu comentario..."
          rows={3}
          className="mb-3 w-full resize-none rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#374151] placeholder:text-[#9ca3af] focus:border-[#e85102] focus:outline-none focus:ring-1 focus:ring-[#e85102]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-[#9ca3af]">Ctrl+Enter para enviar</span>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              submitting || !content.trim() || !authorName.trim()
            }
            className="inline-flex items-center gap-1.5 rounded-md bg-[#e85102] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#c44000] disabled:opacity-50"
          >
            <IconSend className="size-3.5" />
            {submitting ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
