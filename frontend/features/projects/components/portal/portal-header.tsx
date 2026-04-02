"use client";

import { useState } from "react";
import {
  IconBell,
  IconSearch,
  IconFile,
  IconNotes,
  IconInfoCircle,
  IconReceipt,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PortalHeaderProps {
  projectName: string;
  clientName: string | null;
  clientCompany: string | null;
  logoUrl?: string | null;
  accentColor?: string;
  pendingApprovals?: number;
  onNavChange?: (nav: string) => void;
  activeNav?: string;
}

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: null },
  { key: "invoices", label: "Faturas", icon: IconReceipt },
  { key: "meetings", label: "Reunioes", icon: IconNotes },
  { key: "about", label: "Sobre", icon: IconInfoCircle },
];

export function PortalHeader({
  projectName,
  clientName,
  clientCompany,
  logoUrl,
  accentColor = "#E85102",
  pendingApprovals = 0,
  onNavChange,
  activeNav = "home",
}: PortalHeaderProps) {
  const initials = clientName
    ? clientName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "CL";

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left: Logo + Project Name */}
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-8 w-auto" />
          ) : (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: accentColor }}
            >
              {projectName.charAt(0)}
            </div>
          )}
          <span className="text-lg font-semibold text-zinc-900">
            {clientCompany ?? projectName}
          </span>
        </div>

        {/* Center: Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavChange?.(item.key)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                activeNav === item.key
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: Notifications + Avatar */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="relative">
            <IconBell className="h-5 w-5 text-zinc-500" />
            {pendingApprovals > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {pendingApprovals}
              </span>
            )}
          </Button>
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarFallback className="bg-zinc-200 text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
