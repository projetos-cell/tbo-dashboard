"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBriefcase,
  IconBuildingStore,
  IconCurrencyDollar,
  IconUsers,
  IconHeartHandshake,
  IconSpeakerphone,
  IconChartBar,
  IconGift,
  IconBook,
  IconMessage,
} from "@tabler/icons-react";

/* ─── Design Tokens ──────────────────────────────────────────────── */

const T = {
  text: "#0f0f0f",
  muted: "#4a4a4a",
  orange: "#c45a1a",
  glass: "rgba(255,255,255,0.65)",
  glassBorder: "rgba(255,255,255,0.45)",
  glassShadow:
    "0 8px 32px rgba(15,15,15,0.06), 0 1px 3px rgba(15,15,15,0.04)",
  glassBlur: "blur(16px) saturate(180%)",
  rSm: "10px",
};

/* ─── Categories ─────────────────────────────────────────────────── */

const CATEGORIES = [
  { label: "Projetos", href: "/projetos", icon: IconBriefcase, color: "#3b82f6" },
  { label: "Comercial", href: "/comercial", icon: IconBuildingStore, color: "#c45a1a" },
  { label: "Financeiro", href: "/financeiro", icon: IconCurrencyDollar, color: "#10b981" },
  { label: "Pessoas", href: "/pessoas", icon: IconUsers, color: "#8b5cf6" },
  { label: "Cultura", href: "/cultura", icon: IconHeartHandshake, color: "#f43f5e" },
  { label: "Chat", href: "/chat", icon: IconMessage, color: "#0ea5e9" },
  { label: "Marketing", href: "/marketing", icon: IconSpeakerphone, color: "#6366f1" },
  { label: "Rewards", href: "/rewards", icon: IconGift, color: "#ec4899" },
  { label: "Analytics", href: "/relatorios", icon: IconChartBar, color: "#06b6d4" },
  { label: "Wiki", href: "/cultura/conhecimento", icon: IconBook, color: "#f59e0b" },
];

/* ─── Component ──────────────────────────────────────────────────── */

export function CategoryNavCards() {
  const pathname = usePathname();

  return (
    <div className="grid grid-cols-5 gap-2">
      {CATEGORIES.map((cat) => {
        const isActive = pathname.startsWith(cat.href);
        const Icon = cat.icon;
        return (
          <Link
            key={cat.label}
            href={cat.href}
            className="relative flex flex-col items-center gap-1.5 px-2 py-3 transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{
              background: isActive ? `${cat.color}12` : T.glass,
              backdropFilter: T.glassBlur,
              WebkitBackdropFilter: T.glassBlur,
              border: `1px solid ${isActive ? `${cat.color}30` : T.glassBorder}`,
              borderRadius: T.rSm,
              boxShadow: isActive
                ? `0 4px 16px ${cat.color}18`
                : T.glassShadow,
              minWidth: "auto",
            }}
          >
            <div
              className="relative z-10 size-8 flex items-center justify-center rounded-lg transition-colors"
              style={{
                background: isActive ? `${cat.color}18` : "rgba(15,15,15,0.04)",
              }}
            >
              <Icon
                className="size-4"
                style={{ color: isActive ? cat.color : T.muted }}
              />
            </div>
            <span
              className="relative z-10 text-[11px] font-medium whitespace-nowrap"
              style={{
                color: isActive ? cat.color : T.muted,
                fontWeight: isActive ? 600 : 500,
              }}
            >
              {cat.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
