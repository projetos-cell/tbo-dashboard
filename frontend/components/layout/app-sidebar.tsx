"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard, ListChecks, MessageSquare, FolderKanban, PackageCheck,
  Video, Scale, Calendar, Users, DollarSign, Briefcase, Building2, FileText,
  Target, HeartHandshake, LayoutTemplate, Share2, TrendingUp, BarChart3,
  Bell, Settings, LogOut, History, PenTool, CheckCircle, Lightbulb,
  Presentation, Lock, Shield, Activity, Globe,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

const ICON_MAP: Record<string, React.ElementType> = {
  "layout-dashboard": LayoutDashboard,
  "list-checks": ListChecks,
  "message-square": MessageSquare,
  "folder-kanban": FolderKanban,
  "package-check": PackageCheck,
  video: Video,
  scale: Scale,
  calendar: Calendar,
  users: Users,
  "dollar-sign": DollarSign,
  briefcase: Briefcase,
  "building-2": Building2,
  "file-text": FileText,
  target: Target,
  "heart-handshake": HeartHandshake,
  "layout-template": LayoutTemplate,
  "share-2": Share2,
  "trending-up": TrendingUp,
  "bar-chart-3": BarChart3,
  bell: Bell,
  settings: Settings,
  history: History,
  "pen-tool": PenTool,
  "check-circle": CheckCircle,
  lightbulb: Lightbulb,
  presentation: Presentation,
  lock: Lock,
  shield: Shield,
  activity: Activity,
  globe: Globe,
};

interface NavItem {
  href: string;
  label: string;
  icon: string;
  module: string;
}

const FAVORITOS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "layout-dashboard", module: "dashboard" },
  { href: "/tarefas", label: "Tarefas", icon: "list-checks", module: "tarefas" },
  { href: "/chat", label: "Chat", icon: "message-square", module: "chat" },
];

const OPERACAO: NavItem[] = [
  { href: "/projetos", label: "Projetos", icon: "folder-kanban", module: "projetos" },
  { href: "/entregas", label: "Entregas", icon: "package-check", module: "entregas" },
  { href: "/reunioes", label: "Reunioes", icon: "video", module: "reunioes" },
  { href: "/decisoes", label: "Decisoes", icon: "scale", module: "decisoes" },
  { href: "/agenda", label: "Agenda", icon: "calendar", module: "agenda" },
  { href: "/pessoas", label: "Pessoas", icon: "users", module: "pessoas" },
];

const NEGOCIOS: NavItem[] = [
  { href: "/financeiro", label: "Financeiro", icon: "dollar-sign", module: "financeiro" },
  { href: "/comercial", label: "Comercial", icon: "briefcase", module: "comercial" },
  { href: "/clientes", label: "Clientes", icon: "building-2", module: "clientes" },
  { href: "/contratos", label: "Contratos", icon: "file-text", module: "contratos" },
  { href: "/okrs", label: "OKRs", icon: "target", module: "okrs" },
];

const SISTEMA: NavItem[] = [
  { href: "/cultura", label: "Cultura", icon: "heart-handshake", module: "cultura" },
  { href: "/templates", label: "Templates", icon: "layout-template", module: "templates" },
  { href: "/rsm", label: "Redes Sociais", icon: "share-2", module: "rsm" },
  { href: "/mercado", label: "Mercado", icon: "trending-up", module: "mercado" },
  { href: "/relatorios", label: "Relatorios", icon: "bar-chart-3", module: "relatorios" },
  { href: "/alerts", label: "Alertas", icon: "bell", module: "alerts" },
  { href: "/configuracoes", label: "Configuracoes", icon: "settings", module: "configuracoes" },
];

function NavSection({ label, items, canSee, pathname }: {
  label: string;
  items: NavItem[];
  canSee: (m: string) => boolean;
  pathname: string;
}) {
  const visible = items.filter((i) => canSee(i.module));
  if (visible.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {visible.map((item) => {
            const Icon = ICON_MAP[item.icon] ?? FolderKanban;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const modules = useAuthStore((s) => s.modules);

  const canSee = (module: string) =>
    modules.includes("*") || modules.includes(module);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            T
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight">TBO</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Dashboard</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <NavSection label="Favoritos" items={FAVORITOS} canSee={canSee} pathname={pathname} />
        <NavSection label="Operacao" items={OPERACAO} canSee={canSee} pathname={pathname} />
        <NavSection label="Negocios" items={NEGOCIOS} canSee={canSee} pathname={pathname} />
        <NavSection label="Sistema" items={SISTEMA} canSee={canSee} pathname={pathname} />
      </SidebarContent>

      <SidebarFooter className="border-t p-2 space-y-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/changelog"}>
              <Link href="/changelog">
                <History className="h-4 w-4" />
                <span>Changelog</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
