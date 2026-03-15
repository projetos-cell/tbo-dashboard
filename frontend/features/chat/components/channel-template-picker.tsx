"use client";

import { IconTemplate } from "@tabler/icons-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CHANNEL_TEMPLATES, type ChannelTemplate } from "@/features/chat/services/channel-templates";

interface ChannelTemplatePickerProps {
  onSelect: (template: ChannelTemplate) => void;
}

export function ChannelTemplatePicker({ onSelect }: ChannelTemplatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          <IconTemplate size={14} />
          Usar template
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-72 p-0">
        <div className="px-3 py-2 border-b">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Templates de canal</p>
        </div>
        <ScrollArea className="max-h-72">
          <div className="p-1">
            {CHANNEL_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => onSelect(tpl)}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                  "hover:bg-accent/60",
                )}
              >
                <span className="text-base leading-5 shrink-0 mt-0.5">{tpl.emoji}</span>
                <span className="flex-1 min-w-0">
                  <span className="block font-medium text-sm truncate">{tpl.label}</span>
                  <span className="block text-xs text-muted-foreground truncate">{tpl.description}</span>
                </span>
                {tpl.isReadOnly && (
                  <span className="text-[10px] bg-muted text-muted-foreground rounded px-1 py-0.5 shrink-0 mt-1">
                    read-only
                  </span>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
