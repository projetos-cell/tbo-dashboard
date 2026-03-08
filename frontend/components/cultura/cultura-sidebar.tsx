"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Columns3,
  Repeat,
  Shield,
  Award,
  Gift,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CULTURA_NAV_ITEMS } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";

const ICON_MAP: Record<string, React.ElementType> = {
  "layout-dashboard": LayoutDashboard,
  "columns-3": Columns3,
  repeat: Repeat,
  shield: Shield,
  award: Award,
  gift: Gift,
  "book-open": BookOpen,
  "bar-chart-3": BarChart3,
};

export function CulturaSidebar() {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);

  return (
    <nav className="w-52 shrink-0 border-r bg-gray-100/30 p-3 space-y-1 hidden md:block">
      <h2 className="px-2 mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Cultura
      </h2>
      {CULTURA_NAV_ITEMS.map((item) => {
        // Hide founders-only items for non-admin/po roles
        if (
          "founders_only" in item &&
          item.founders_only &&
          role !== "founder" &&
          role !== "diretoria"
        ) {
          return null;
        }

        const Icon = ICON_MAP[item.icon] || LayoutDashboard;
        const isActive =
          item.href === "/cultura"
            ? pathname === "/cultura"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
              isActive
                ? "bg-tbo-orange/10 text-tbo-orange font-medium"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
