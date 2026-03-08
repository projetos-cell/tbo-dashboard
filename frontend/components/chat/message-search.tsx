"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/tbo-ui/input";
import { Button } from "@/components/tbo-ui/button";
import { ScrollArea } from "@/components/tbo-ui/scroll-area";
import { useChatStore } from "@/stores/chat-store";
import { useChatSearch } from "@/hooks/use-chat-search";
import { useProfiles } from "@/hooks/use-people";

interface MessageSearchProps {
  channels: { id: string; name: string | null }[];
}

export function MessageSearch({ channels }: MessageSearchProps) {
  const isOpen = useChatStore((s) => s.isSearchOpen);
  const toggle = useChatStore((s) => s.toggleSearch);
  const query = useChatStore((s) => s.searchQuery);
  const setQuery = useChatStore((s) => s.setSearchQuery);
  const setSelectedChannelId = useChatStore((s) => s.setSelectedChannelId);

  const { data: results, isLoading } = useChatSearch(query);
  const { data: profiles } = useProfiles();

  if (!isOpen) return null;

  const channelMap: Record<string, string> = {};
  for (const ch of channels) {
    channelMap[ch.id] = ch.name ?? ch.id.slice(0, 8);
  }

  const profileMap: Record<string, string> = {};
  for (const p of profiles ?? []) {
    if (p.full_name) profileMap[p.id] = p.full_name;
  }

  function handleSelect(channelId: string) {
    setSelectedChannelId(channelId);
    toggle();
    setQuery("");
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-white">
      {/* Search header */}
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <Search className="h-4 w-4 text-gray-500 shrink-0" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar mensagens..."
          className="flex-1 border-0 focus-visible:ring-0 h-8"
          autoFocus
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => {
            toggle();
            setQuery("");
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {query.trim().length < 2 ? (
            <p className="text-xs text-gray-500 text-center py-8">
              Digite pelo menos 2 caracteres para buscar.
            </p>
          ) : isLoading ? (
            <p className="text-xs text-gray-500 text-center py-8">
              Buscando...
            </p>
          ) : !results || results.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-8">
              Nenhuma mensagem encontrada.
            </p>
          ) : (
            results.map((msg) => {
              const senderName =
                profileMap[msg.sender_id] ?? msg.sender_id.slice(0, 8);
              const channelName =
                channelMap[msg.channel_id] ?? msg.channel_id.slice(0, 8);
              const time = new Date(
                msg.created_at ?? "",
              ).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });

              // Truncate content snippet
              const snippet =
                (msg.content?.length ?? 0) > 120
                  ? msg.content!.slice(0, 120) + "..."
                  : (msg.content ?? "");

              return (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => handleSelect(msg.channel_id)}
                  className="flex flex-col gap-0.5 w-full rounded-md px-3 py-2 text-left hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium text-gray-900">
                      {senderName}
                    </span>
                    <span>em</span>
                    <span className="font-medium">#{channelName}</span>
                    <span className="ml-auto">{time}</span>
                  </div>
                  <p className="text-sm text-gray-900/80 line-clamp-2">
                    {snippet}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
