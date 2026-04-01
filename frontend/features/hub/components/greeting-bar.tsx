"use client";

import Link from "next/link";
import {
  IconBriefcase,
  IconClipboardList,
  IconMessage,
  IconRocket,
} from "@tabler/icons-react";

/* ─── Helpers ──────────────────────────────────────────────────── */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function getTodayLabel(): string {
  const d = new Date();
  const weekday = ["Domingo", "Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"][d.getDay()];
  const day = d.getDate();
  const month = [
    "janeiro", "fevereiro", "marco", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ][d.getMonth()];
  return `${weekday}, ${day} de ${month}`;
}

const QUICK_ACTIONS = [
  { label: "Novo Projeto", href: "/projetos", icon: IconBriefcase, color: "#3b82f6" },
  { label: "Nova Tarefa", href: "/tarefas", icon: IconClipboardList, color: "#10b981" },
  { label: "Pipeline", href: "/comercial", icon: IconRocket, color: "#c45a1a" },
  { label: "Chat", href: "/chat", icon: IconMessage, color: "#0ea5e9" },
];

/* ─── Component ───────────────────────────────────────────────── */

export function GreetingBar({
  firstName,
  avatarUrl,
}: {
  firstName: string;
  avatarUrl?: string;
}) {
  return (
    <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-[#1a1410] via-[#2d1810] to-hub-orange shadow-[0_8px_32px_rgba(196,90,26,0.15)]">
      {/* Decorative */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute -top-8 -right-8 size-32 border-2 border-white rounded-full" />
        <div className="absolute bottom-0 left-10 size-16 border-2 border-white rounded-full" />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">
            {getGreeting()},{" "}
            <span className="text-[#f0ede9]">{firstName}</span>
          </h1>
          <p className="text-xs text-white/50 mt-0.5">{getTodayLabel()}</p>
        </div>

        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="size-10 rounded-full ring-2 ring-white/20 object-cover"
          />
        ) : (
          <div className="size-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold text-white/70">
            {firstName.charAt(0)}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="relative z-10 flex gap-2 mt-4">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.label}
              href={a.href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors bg-white/[0.08]"
            >
              <Icon className="size-3.5" style={{ color: a.color }} />
              {a.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
