"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import {
  IconBell,
  IconLayoutDashboard,
  IconX,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";

export function HubHeader() {
  const user = useAuthStore((s) => s.user);
  const roleLabel = useAuthStore((s) => s.roleLabel);
  const role = useAuthStore((s) => s.role);
  const [showNotifs, setShowNotifs] = useState(false);

  const firstName = useMemo(() => {
    if (!user) return "";
    const fullName = user.user_metadata?.full_name as string | undefined;
    if (fullName) return fullName.split(" ")[0];
    return user.email?.split("@")[0] ?? "";
  }, [user]);

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <header className="flex items-center justify-between px-4 py-3 md:px-8 lg:px-12 border-b border-border/40">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
          T
        </div>
        <div>
          <p className="text-sm font-bold leading-none tracking-tight">TBO</p>
          <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
            Home
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconLayoutDashboard className="size-3.5" />
          Dashboard
        </Link>

        {/* Bell / Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs((s) => !s)}
            className="relative size-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
          >
            <IconBell className="size-4 text-muted-foreground" />
            {/* Unread dot */}
            <span className="absolute top-1 right-1 size-2 rounded-full bg-[#c45a1a] ring-2 ring-background" />
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-popover border rounded-xl shadow-lg z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <h3 className="text-sm font-semibold">Notificacoes</h3>
                  <button
                    onClick={() => setShowNotifs(false)}
                    className="size-6 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                  >
                    <IconX className="size-3.5 text-muted-foreground" />
                  </button>
                </div>
                <div className="px-4 py-8 text-center">
                  <IconBell className="size-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">
                    Nenhuma notificacao nova
                  </p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">
                    Mentions, comentarios e avisos aparecerao aqui
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2.5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={firstName}
              className="size-8 rounded-full object-cover ring-1 ring-border/40"
            />
          ) : (
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
              {firstName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-none">{firstName}</p>
            <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
              {roleLabel ?? role ?? "Membro"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
