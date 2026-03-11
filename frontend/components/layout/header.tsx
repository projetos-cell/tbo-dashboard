"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState, useCallback } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/use-user";
import { useProfile } from "@/features/configuracoes/hooks/use-settings";
import { useAuthStore } from "@/stores/auth-store";
import { useAlertCount } from "@/hooks/use-alert-count";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconSearch,
  IconSun,
  IconMoon,
  IconBell,
  IconSettings,
  IconUser,
  IconLogout,
} from "@tabler/icons-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CommandSearch } from "@/components/layout/command-search";
import { useLogout } from "@/hooks/use-logout";

// ── Theme Toggle (inline — Tabler icons + View Transition) ────────────

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggle = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    if (document.startViewTransition) {
      document.startViewTransition(() => setTheme(next));
    } else {
      setTheme(next);
    }
  }, [theme, setTheme]);

  if (!mounted) return <div className="h-5 w-5" />;

  const isDark = theme === "dark";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggle}
          className="rounded-md text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
        >
          {isDark ? (
            <IconSun className="h-5 w-5" strokeWidth={1.5} />
          ) : (
            <IconMoon className="h-5 w-5" strokeWidth={1.5} />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {isDark ? "Modo claro" : "Modo escuro"}
      </TooltipContent>
    </Tooltip>
  );
}

// ── Notification Bell ─────────────────────────────────────────────────

function NotificationBell() {
  const router = useRouter();
  const count = useAlertCount();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => router.push("/alertas")}
          className="relative rounded-md text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          aria-label={`Notificações${count > 0 ? ` (${count})` : ""}`}
        >
          <IconBell className="h-5 w-5" strokeWidth={1.5} />
          {count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-semibold leading-none text-white">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Notificações</TooltipContent>
    </Tooltip>
  );
}

// ── Search Button ─────────────────────────────────────────────────────

function SearchButton() {
  const openSearch = useCallback(() => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true })
    );
  }, []);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={openSearch}
          className="rounded-md text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          aria-label="Buscar (⌘K)"
        >
          <IconSearch className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <span className="flex items-center gap-1.5">
          Buscar
          <kbd className="rounded border border-border/50 bg-muted px-1 py-0.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

// ── User Avatar ───────────────────────────────────────────────────────

function UserAvatar() {
  const router = useRouter();
  const { user } = useUser();
  const { data: profile } = useProfile();
  const roleLabel = useAuthStore((s) => s.roleLabel);
  const handleLogout = useLogout();

  const displayName = profile?.full_name || user?.email || "Usuário";
  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : user?.email
      ? user.email.slice(0, 2).toUpperCase()
      : "TB";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Menu do usuário"
        >
          <Avatar className="h-9 w-9 ring-2 ring-border/40">
            {profile?.avatar_url && (
              <AvatarImage src={profile.avatar_url} alt={displayName} />
            )}
            <AvatarFallback className="bg-gradient-to-br from-slate-400/80 via-slate-500/70 to-blue-600/60 text-xs font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {user?.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            )}
            {roleLabel && (
              <p className="text-xs leading-none text-muted-foreground">
                {roleLabel}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/configuracoes")}>
            <IconSettings className="h-4 w-4" strokeWidth={1.5} />
            <span>Configurações</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/configuracoes")}>
            <IconUser className="h-4 w-4" strokeWidth={1.5} />
            <span>Perfil</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <IconLogout className="h-4 w-4" strokeWidth={1.5} />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Header (Main Export) ──────────────────────────────────────────────

export function Header() {
  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/40 bg-background/80 px-4 backdrop-blur-sm">
        {/* Left — Sidebar trigger + Breadcrumbs */}
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 !h-4" />
        <Breadcrumbs />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right — Search, Theme, Notifications, Avatar */}
        <div className="flex items-center gap-5">
          <SearchButton />
          <ThemeToggle />
          <NotificationBell />
          <UserAvatar />
        </div>
      </header>
      <CommandSearch />
    </>
  );
}
