"use client";

import { useState } from "react";
import {
  IconCircleCheck,
  IconClock,
  IconPlayerPlay,
  IconEye,
  IconCheck,
  IconX,
  IconMessage,
  IconChevronDown,
  IconChevronUp,
  IconActivity,
} from "@tabler/icons-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PortalTask {
  id: string;
  title: string;
  status: string;
  is_completed: boolean;
  due_date: string | null;
  requires_client_approval: boolean | null;
  client_approval_status: string | null;
  client_approval_comment: string | null;
  client_approval_at: string | null;
}

interface StatusUpdate {
  id: string;
  status: string;
  summary: string | null;
  created_at: string;
  author_name: string | null;
}

interface PortalProject {
  id: string;
  name: string;
  status: string | null;
  client: string | null;
  client_company: string | null;
  due_date_start: string | null;
  due_date_end: string | null;
  cover_url: string | null;
}

interface ProjectPortalViewProps {
  project: PortalProject;
  tasks: PortalTask[];
  latestUpdate: StatusUpdate | null;
  progressPercent: number;
  completedCount: number;
  totalCount: number;
  token: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  em_andamento: "Em andamento",
  revisao: "Em revisão",
  concluida: "Concluída",
};

const STATUS_UPDATE_LABELS: Record<string, { label: string; color: string }> = {
  on_track: { label: "No prazo", color: "#22c55e" },
  at_risk: { label: "Em risco", color: "#f59e0b" },
  off_track: { label: "Atrasado", color: "#ef4444" },
  on_hold: { label: "Pausado", color: "#6b7280" },
  complete: { label: "Concluído", color: "#3b82f6" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getHealthColor(percent: number): string {
  if (percent >= 75) return "#22c55e";
  if (percent >= 40) return "#f59e0b";
  return "#ef4444";
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ProjectPortalView({
  project,
  tasks,
  latestUpdate,
  progressPercent,
  completedCount,
  totalCount,
  token,
}: ProjectPortalViewProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-lg font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #e85102, #c44000)" }}
          >
            {project.name?.charAt(0)?.toUpperCase() ?? "P"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">
              {project.name}
            </h1>
            {(project.client || project.client_company) && (
              <p className="text-sm text-[#4a5f7a]">
                {project.client_company ?? project.client}
              </p>
            )}
          </div>
        </div>
        {(project.due_date_start || project.due_date_end) && (
          <p className="mt-2 text-xs text-[#4a5f7a]">
            <IconClock className="mr-1 inline-block size-3.5" />
            {formatDate(project.due_date_start)} — {formatDate(project.due_date_end)}
          </p>
        )}
      </header>

      {/* ── Progress Card ──────────────────────────────────────── */}
      <div className="mb-6 rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#1a1a2e]">Progresso</h2>
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: getHealthColor(progressPercent) }}
          >
            {progressPercent}%
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: getHealthColor(progressPercent),
            }}
          />
        </div>
        <p className="mt-2 text-xs text-[#4a5f7a]">
          {completedCount} de {totalCount} entregas concluídas
        </p>
      </div>

      {/* ── Latest Status Update ───────────────────────────────── */}
      {latestUpdate && (
        <div className="mb-6 rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-1.5">
              <IconActivity className="size-4" />
              Última atualização
            </h2>
            {STATUS_UPDATE_LABELS[latestUpdate.status] && (
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                style={{
                  backgroundColor:
                    STATUS_UPDATE_LABELS[latestUpdate.status]?.color ?? "#6b7280",
                }}
              >
                {STATUS_UPDATE_LABELS[latestUpdate.status]?.label}
              </span>
            )}
          </div>
          <p className="text-sm text-[#374151] leading-relaxed">
            {latestUpdate.summary}
          </p>
          <p className="mt-2 text-xs text-[#9ca3af]">
            {latestUpdate.author_name && `${latestUpdate.author_name} · `}
            {formatDate(latestUpdate.created_at)}
          </p>
        </div>
      )}

      {/* ── Deliverables ───────────────────────────────────────── */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="border-b border-[#e5e7eb] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#1a1a2e]">Entregas</h2>
        </div>
        {tasks.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[#9ca3af]">
            Nenhuma entrega visível no momento.
          </div>
        ) : (
          <ul className="divide-y divide-[#f0f0f0]">
            {tasks.map((task) => (
              <DeliverableRow key={task.id} task={task} token={token} />
            ))}
          </ul>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="mt-10 text-center text-xs text-[#9ca3af]">
        Powered by <span className="font-medium text-[#e85102]">TBO OS</span>
      </footer>
    </div>
  );
}

// ─── Deliverable Row ────────────────────────────────────────────────────────

function DeliverableRow({
  task,
  token,
}: {
  task: PortalTask;
  token: string;
}) {
  const [approvalStatus, setApprovalStatus] = useState(
    task.client_approval_status
  );
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsApproval =
    task.requires_client_approval &&
    (approvalStatus === "pending" || approvalStatus === "none");

  const handleApproval = async (status: "approved" | "rejected") => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          taskId: task.id,
          status,
          comment: comment.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Erro ao salvar aprovação");
      }

      setApprovalStatus(status);
      setShowForm(false);
      setComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <li className="px-5 py-4">
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div className="mt-0.5">
          {task.is_completed ? (
            <IconCircleCheck className="size-5 text-[#22c55e]" />
          ) : task.status === "revisao" ? (
            <IconEye className="size-5 text-[#f59e0b]" />
          ) : (
            <IconPlayerPlay className="size-5 text-[#3b82f6]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-sm font-medium ${
                task.is_completed
                  ? "text-[#9ca3af] line-through"
                  : "text-[#1a1a2e]"
              }`}
            >
              {task.title}
            </span>
            <span className="shrink-0 text-xs text-[#9ca3af]">
              {STATUS_LABELS[task.status] ?? task.status}
            </span>
          </div>

          {task.due_date && (
            <p className="mt-0.5 text-xs text-[#9ca3af]">
              Prazo: {formatDate(task.due_date)}
            </p>
          )}

          {/* Approval badge (already decided) */}
          {task.requires_client_approval &&
            approvalStatus !== "none" &&
            approvalStatus !== "pending" && (
              <div className="mt-2 flex items-center gap-1.5">
                {approvalStatus === "approved" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-xs font-medium text-[#166534]">
                    <IconCheck className="size-3" />
                    Aprovado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fee2e2] px-2.5 py-0.5 text-xs font-medium text-[#991b1b]">
                    <IconX className="size-3" />
                    Rejeitado
                  </span>
                )}
                {task.client_approval_comment && (
                  <span className="text-xs text-[#6b7280] flex items-center gap-1">
                    <IconMessage className="size-3" />
                    {task.client_approval_comment}
                  </span>
                )}
              </div>
            )}

          {/* Pending approval — toggle form */}
          {needsApproval && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-1 rounded-md border border-[#e85102] bg-[#fff7ed] px-3 py-1.5 text-xs font-medium text-[#e85102] transition-colors hover:bg-[#ffedd5]"
              >
                Aprovar / Rejeitar
                {showForm ? (
                  <IconChevronUp className="size-3" />
                ) : (
                  <IconChevronDown className="size-3" />
                )}
              </button>

              {showForm && (
                <div className="mt-3 rounded-lg border border-[#e5e7eb] bg-[#fafafa] p-4 space-y-3">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Comentário (opcional)"
                    rows={2}
                    className="w-full resize-none rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#374151] placeholder:text-[#9ca3af] focus:border-[#e85102] focus:outline-none focus:ring-1 focus:ring-[#e85102]"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleApproval("approved")}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#22c55e] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#16a34a] disabled:opacity-50"
                    >
                      <IconCheck className="size-3.5" />
                      {submitting ? "Salvando..." : "Aprovar"}
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleApproval("rejected")}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#ef4444] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#dc2626] disabled:opacity-50"
                    >
                      <IconX className="size-3.5" />
                      {submitting ? "Salvando..." : "Rejeitar"}
                    </button>
                  </div>
                  {error && (
                    <p className="text-xs text-[#ef4444]">{error}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
