"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  List,
  Kanban,
  Clock,
  GanttChartSquare,
  Calendar,
  FolderOpen,
  Copy,
  Settings,
  Users,
  MessageSquare,
  Target,
  Award,
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
  PieChart,
  Upload,
  Plug,
  BarChart3,
  UserPlus,
  FileText,
  Activity,
  Building2,
  Contact,
  FolderKanban,
  Building,
  User,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { hasMinRole } from "@/lib/permissions";
import type { SubNavItem } from "@/lib/constants";
import type { RoleSlug } from "@/lib/permissions";

const ICON_MAP: Record<string, React.ElementType> = {
  "layout-dashboard": LayoutDashboard,
  list: List,
  kanban: Kanban,
  clock: Clock,
  "gantt-chart-square": GanttChartSquare,
  calendar: Calendar,
  "folder-open": FolderOpen,
  copy: Copy,
  settings: Settings,
  users: Users,
  "message-square": MessageSquare,
  target: Target,
  award: Award,
  "trending-up": TrendingUp,
  "arrow-up-circle": ArrowUpCircle,
  "arrow-down-circle": ArrowDownCircle,
  "pie-chart": PieChart,
  upload: Upload,
  plug: Plug,
  "bar-chart-3": BarChart3,
  "user-plus": UserPlus,
  "file-text": FileText,
  activity: Activity,
  "building-2": Building2,
  contact: Contact,
  "folder-kanban": FolderKanban,
  building: Building,
  user: User,
  "check-circle": CheckCircle,
};

interface ModuleSidebarProps {
  title: string;
  items: readonly SubNavItem[];
  basePath: string;
}

export function ModuleSidebar({ title, items, basePath }: ModuleSidebarProps) {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);

  return (
    <nav className="w-52 shrink-0 border-r bg-gray-100/30 p-3 space-y-1 hidden md:block">
      <h2 className="px-2 mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        {title}
      </h2>
      {items.map((item) => {
        if (item.min_role && !hasMinRole(role as RoleSlug, item.min_role)) {
          return null;
        }

        const Icon = ICON_MAP[item.icon] || LayoutDashboard;
        const isActive =
          item.href === basePath
            ? pathname === basePath
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
