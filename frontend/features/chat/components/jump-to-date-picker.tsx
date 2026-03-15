"use client";

import { useState } from "react";
import { IconCalendarSearch, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getMessagesAroundDate } from "@/features/chat/services/chat";
import type { ProfileInfo } from "@/features/chat/utils/profile-utils";

interface JumpToDatePickerProps {
  channelId: string;
  profileMap: Record<string, ProfileInfo>;
  onJumpToMessage: (messageId: string) => void;
}

export function JumpToDatePicker({
  channelId,
  profileMap,
  onJumpToMessage,
}: JumpToDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const { data: messages, isLoading } = useQuery({
    queryKey: ["chat-jump-to-date", channelId, selectedDate?.toDateString()],
    queryFn: async () => {
      if (!selectedDate) return [];
      const supabase = createClient();
      return getMessagesAroundDate(supabase, channelId, selectedDate);
    },
    enabled: !!selectedDate,
    staleTime: 60_000,
  });

  function handleSelectDate(date: Date | undefined) {
    setSelectedDate(date);
  }

  function handleJump(messageId: string) {
    onJumpToMessage(messageId);
    setOpen(false);
    setSelectedDate(undefined);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <IconCalendarSearch size={16} />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Ir para data</TooltipContent>
      </Tooltip>

      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex flex-col">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelectDate}
            toDate={new Date()}
            initialFocus
          />

          {selectedDate && (
            <div className="border-t">
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                {selectedDate.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <IconLoader2 size={16} className="animate-spin text-muted-foreground" />
                </div>
              ) : !messages || messages.length === 0 ? (
                <p className="px-3 pb-3 text-xs text-muted-foreground">
                  Nenhuma mensagem nesta data.
                </p>
              ) : (
                <ScrollArea className="max-h-48">
                  <div className="flex flex-col gap-0.5 p-2">
                    {messages.map((msg) => {
                      const sender = profileMap[msg.sender_id];
                      const time = new Date(msg.created_at ?? "").toLocaleTimeString(
                        "pt-BR",
                        { hour: "2-digit", minute: "2-digit" },
                      );
                      const snippet =
                        (msg.content?.length ?? 0) > 80
                          ? msg.content!.slice(0, 80) + "..."
                          : (msg.content ?? "(arquivo)");

                      return (
                        <button
                          key={msg.id}
                          type="button"
                          onClick={() => handleJump(msg.id)}
                          className="flex flex-col gap-0.5 rounded px-2 py-1.5 text-left hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {sender?.name ?? "Usuário"}
                            </span>
                            <span className="ml-auto">{time}</span>
                          </div>
                          <p className="text-xs text-foreground/70 line-clamp-1">{snippet}</p>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
