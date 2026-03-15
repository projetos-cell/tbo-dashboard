"use client";

import { useState, useMemo } from "react";
import {
  IconSearch,
  IconX,
  IconFilter,
  IconHash,
  IconUser,
  IconCalendar,
  IconFileText,
  IconLink,
  IconMessage,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { useChatSearchAdvanced, type SearchFilters } from "@/features/chat/hooks/use-chat-search";
import { useProfiles } from "@/features/people/hooks/use-people";
import type { MessageSearchType } from "@/features/chat/services/chat";
import { cn } from "@/lib/utils";

interface MessageSearchProps {
  channels: { id: string; name: string | null }[];
  currentChannelId?: string | null;
}

const TYPE_OPTIONS: { value: MessageSearchType; label: string; icon: typeof IconMessage }[] = [
  { value: "message", label: "Mensagem", icon: IconMessage },
  { value: "file", label: "Arquivo", icon: IconFileText },
  { value: "link", label: "Link", icon: IconLink },
];

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Remover filtro"
      >
        <IconX size={10} />
      </button>
    </Badge>
  );
}

export function MessageSearch({ channels, currentChannelId }: MessageSearchProps) {
  const isOpen = useChatStore((s) => s.isSearchOpen);
  const toggle = useChatStore((s) => s.toggleSearch);
  const query = useChatStore((s) => s.searchQuery);
  const setQuery = useChatStore((s) => s.setSearchQuery);
  const setSelectedChannelId = useChatStore((s) => s.setSelectedChannelId);

  const [showFilters, setShowFilters] = useState(false);
  const [filterChannelId, setFilterChannelId] = useState<string>("__all__");
  const [filterAuthorId, setFilterAuthorId] = useState<string>("__all__");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterType, setFilterType] = useState<MessageSearchType | "__all__">("__all__");

  // #22 — "neste canal" shortcut
  const [inChannelOnly, setInChannelOnly] = useState(false);

  const { data: profiles } = useProfiles();

  const filters: SearchFilters = useMemo(() => ({
    channelId: inChannelOnly && currentChannelId
      ? currentChannelId
      : filterChannelId !== "__all__"
        ? filterChannelId
        : undefined,
    authorId: filterAuthorId !== "__all__" ? filterAuthorId : undefined,
    dateFrom: filterDateFrom ? new Date(filterDateFrom).toISOString() : undefined,
    dateTo: filterDateTo
      ? new Date(filterDateTo + "T23:59:59").toISOString()
      : undefined,
    type: filterType !== "__all__" ? filterType : undefined,
  }), [inChannelOnly, currentChannelId, filterChannelId, filterAuthorId, filterDateFrom, filterDateTo, filterType]);

  const { data: results, isLoading } = useChatSearchAdvanced(query, filters);

  const channelMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const ch of channels) map[ch.id] = ch.name ?? ch.id.slice(0, 8);
    return map;
  }, [channels]);

  const profileMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of profiles ?? []) {
      if (p.full_name) map[p.id] = p.full_name;
    }
    return map;
  }, [profiles]);

  const activeFilterCount = [
    filters.channelId,
    filters.authorId,
    filters.dateFrom,
    filters.dateTo,
    filters.type,
  ].filter(Boolean).length;

  function clearFilters() {
    setFilterChannelId("__all__");
    setFilterAuthorId("__all__");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterType("__all__");
    setInChannelOnly(false);
  }

  function handleClose() {
    toggle();
    setQuery("");
    clearFilters();
    setShowFilters(false);
  }

  function handleSelect(channelId: string) {
    setSelectedChannelId(channelId);
    handleClose();
  }

  const hasQuery = query.trim().length >= 2;
  const hasFilter = activeFilterCount > 0;
  const showResults = hasQuery || hasFilter;

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-background">
      {/* Search header */}
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <IconSearch className="h-4 w-4 text-muted-foreground shrink-0" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar mensagens..."
          className="flex-1 border-0 focus-visible:ring-0 h-8"
          autoFocus
        />

        {/* #22 — In-channel toggle */}
        {currentChannelId && (
          <Button
            variant={inChannelOnly ? "default" : "ghost"}
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => setInChannelOnly((v) => !v)}
          >
            <IconHash size={12} />
            Neste canal
          </Button>
        )}

        <Button
          variant={showFilters ? "secondary" : "ghost"}
          size="icon"
          className={cn("h-7 w-7 shrink-0 relative")}
          onClick={() => setShowFilters((v) => !v)}
        >
          <IconFilter className="h-3.5 w-3.5" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full text-[9px] w-3.5 h-3.5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={handleClose}
        >
          <IconX className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="border-b px-4 py-3 space-y-3 bg-muted/30">
          <div className="grid grid-cols-2 gap-2">
            {/* Channel filter */}
            <Select value={filterChannelId} onValueChange={setFilterChannelId}>
              <SelectTrigger className="h-8 text-xs">
                <IconHash size={12} className="mr-1 shrink-0" />
                <SelectValue placeholder="Todos os canais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos os canais</SelectItem>
                {channels.map((ch) => (
                  <SelectItem key={ch.id} value={ch.id}>
                    #{ch.name ?? ch.id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Author filter */}
            <Select value={filterAuthorId} onValueChange={setFilterAuthorId}>
              <SelectTrigger className="h-8 text-xs">
                <IconUser size={12} className="mr-1 shrink-0" />
                <SelectValue placeholder="Qualquer autor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Qualquer autor</SelectItem>
                {(profiles ?? []).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name ?? p.id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date from */}
            <div className="relative">
              <IconCalendar
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="h-8 text-xs pl-7"
                placeholder="De"
              />
            </div>

            {/* Date to */}
            <div className="relative">
              <IconCalendar
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="h-8 text-xs pl-7"
                placeholder="Até"
              />
            </div>
          </div>

          {/* Type filters */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Tipo:</span>
            <div className="flex gap-1">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setFilterType((v) => (v === opt.value ? "__all__" : opt.value))
                  }
                  className={cn(
                    "flex items-center gap-1 rounded px-2 py-0.5 text-xs transition-colors",
                    filterType === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                  )}
                >
                  <opt.icon size={11} />
                  {opt.label}
                </button>
              ))}
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.channelId && (
                <FilterChip
                  label={`#${channelMap[filters.channelId] ?? filters.channelId.slice(0, 8)}`}
                  onRemove={() => {
                    setFilterChannelId("__all__");
                    setInChannelOnly(false);
                  }}
                />
              )}
              {filters.authorId && (
                <FilterChip
                  label={profileMap[filters.authorId] ?? filters.authorId.slice(0, 8)}
                  onRemove={() => setFilterAuthorId("__all__")}
                />
              )}
              {filters.dateFrom && (
                <FilterChip
                  label={`De ${new Date(filters.dateFrom).toLocaleDateString("pt-BR")}`}
                  onRemove={() => setFilterDateFrom("")}
                />
              )}
              {filters.dateTo && (
                <FilterChip
                  label={`Até ${new Date(filters.dateTo).toLocaleDateString("pt-BR")}`}
                  onRemove={() => setFilterDateTo("")}
                />
              )}
              {filters.type && (
                <FilterChip
                  label={TYPE_OPTIONS.find((o) => o.value === filters.type)?.label ?? filters.type}
                  onRemove={() => setFilterType("__all__")}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {!showResults ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              Digite pelo menos 2 caracteres ou aplique um filtro para buscar.
            </p>
          ) : isLoading ? (
            <p className="text-xs text-muted-foreground text-center py-8">Buscando...</p>
          ) : !results || results.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              Nenhuma mensagem encontrada.
            </p>
          ) : (
            results.map((msg) => {
              const senderName =
                profileMap[msg.sender_id] ?? msg.sender_id.slice(0, 8);
              const channelName =
                channelMap[msg.channel_id] ?? msg.channel_id.slice(0, 8);
              const time = new Date(msg.created_at ?? "").toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });
              const snippet =
                (msg.content?.length ?? 0) > 120
                  ? msg.content!.slice(0, 120) + "..."
                  : (msg.content ?? "");

              return (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => handleSelect(msg.channel_id)}
                  className="flex flex-col gap-0.5 w-full rounded-md px-3 py-2 text-left hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{senderName}</span>
                    <span>em</span>
                    <span className="font-medium">#{channelName}</span>
                    <span className="ml-auto">{time}</span>
                  </div>
                  <p className="text-sm text-foreground/80 line-clamp-2">{snippet}</p>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
