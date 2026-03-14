"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState, useCallback, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/hooks/use-user";
import { useProfile } from "@/features/configuracoes/hooks/use-settings";
import { useAuthStore } from "@/stores/auth-store";
import { useAlertCount } from "@/hooks/use-alert-count";
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/hooks/use-alerts";
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
  IconCheck,
} from "@tabler/icons-react";
import { useLogout } from "@/hooks/use-logout";
import type { NotificationRow } from "@/services/alerts";

// ── Theme Toggle ──────────────────────────────────────────────────────

export function ThemeToggle() {
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

// ── Notification Item ─────────────────────────────────────────────────

export function NotificationItem({
  notification,
  onMarkRead,
  onClose,
}: {
  notification: NotificationRow;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const timeLabel = notification.created_at
    ? formatDistanceToNow(new Date(notification.created_at), {
        locale: ptBR,
        addSuffix: false,
      })
    : "";

  return (
    <button
      onClick={() => {
        if (!notification.read) onMarkRead(notification.id);
        onClose();
        if (notification.action_url) router.push(notification.action_url);
      }}
      className="flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent/50"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <IconBell className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${!notification.read ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
          {notification.title}
        </p>
        {notification.body && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
            {notification.body}
          </p>
        )}
        <p className="mt-1 text-[11px] text-muted-foreground/70">{timeLabel}</p>
      </div>
      {!notification.read && (
        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
      )}
    </button>
  );
}

// ── Notification Bell ─────────────────────────────────────────────────

export function NotificationBell() {
  const router = useRouter();
  const count = useAlertCount();
  const [open, setOpen] = useState(false);

  const { data: allNotifications = [] } = useNotifications();
  const markRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();

  const displayItems = useMemo(() => {
    const unread = allNotifications.filter((n) => !n.read);
    const read = allNotifications.filter((n) => n.read);
    return [...unread, ...read].slice(0, 8);
  }, [allNotifications]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
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
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="text-sm font-semibold">Notificações</h4>
          {count > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <IconCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
              Marcar todas
            </button>
          )}
        </div>

        <ScrollArea className="max-h-80">
          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <IconBell className="h-8 w-8 text-muted-foreground/40" strokeWidth={1.5} />
              <p className="mt-2 text-sm text-muted-foreground">
                Nenhuma notificação
              </p>
            </div>
          ) : (
            <div className="py-1">
              {displayItems.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={(id) => markRead.mutate(id)}
                  onClose={() => setOpen(false)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {allNotifications.length > 0 && (
          <div className="border-t">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/alerts");
              }}
              className="flex w-full items-center justify-center py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Ver todas as notificações
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ── Search Button ─────────────────────────────────────────────────────

export function SearchButton() {
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

export function UserAvatar() {
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
