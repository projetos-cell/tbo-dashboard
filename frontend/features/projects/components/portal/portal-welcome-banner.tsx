"use client";

import { useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";

interface PortalWelcomeBannerProps {
  clientName: string | null;
  projectName: string;
  accentColor?: string;
  onSearch?: (query: string) => void;
}

export function PortalWelcomeBanner({
  clientName,
  projectName,
  accentColor = "#E85102",
  onSearch,
}: PortalWelcomeBannerProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch?.(query.trim());
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl px-8 py-10"
      style={{
        background: `linear-gradient(135deg, #fef3e8 0%, #fde8d8 40%, #fdd5bc 100%)`,
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="absolute -bottom-4 right-24 h-20 w-20 rounded-full opacity-10"
        style={{ backgroundColor: accentColor }}
      />

      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-zinc-900 md:text-4xl">
          Bem-vindo ao Portal {clientName ? `de ${clientName}` : "do Cliente"}!
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Acompanhe o progresso de <span className="font-medium text-zinc-700">{projectName}</span> em tempo real
        </p>

        <form onSubmit={handleSubmit} className="mt-6 max-w-xl">
          <div className="relative">
            <IconSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar docs, tarefas, arquivos..."
              className="h-12 rounded-xl border-zinc-200 bg-white/90 pl-12 text-sm shadow-sm backdrop-blur-sm placeholder:text-zinc-400 focus:bg-white"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
