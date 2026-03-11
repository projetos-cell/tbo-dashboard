"use client";

import { useRef, useEffect, useState } from "react";
import { IconMoodSmile } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  disabled?: boolean;
}

export function EmojiPicker({ onSelect, disabled }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [Picker, setPicker] = useState<React.ComponentType<Record<string, unknown>> | null>(null);
  const [emojiData, setEmojiData] = useState<unknown>(null);

  // Lazy-load emoji-mart only when popover opens
  useEffect(() => {
    if (!open || Picker) return;
    let cancelled = false;

    Promise.all([
      import("@emoji-mart/react"),
      import("@emoji-mart/data"),
    ]).then(([pickerMod, dataMod]) => {
      if (cancelled) return;
      setPicker(() => pickerMod.default);
      setEmojiData(dataMod.default);
    });

    return () => {
      cancelled = true;
    };
  }, [open, Picker]);

  function handleEmojiSelect(emoji: { native?: string }) {
    if (emoji.native) {
      onSelect(emoji.native);
    }
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          disabled={disabled}
          aria-label="Emoji"
        >
          <IconMoodSmile size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-auto p-0 border-none shadow-lg"
        sideOffset={8}
      >
        <div ref={pickerRef}>
          {Picker && emojiData ? (
            <Picker
              data={emojiData}
              onEmojiSelect={handleEmojiSelect}
              theme="auto"
              locale="pt"
              previewPosition="none"
              skinTonePosition="search"
              maxFrequentRows={2}
              perLine={8}
            />
          ) : (
            <div className="flex items-center justify-center h-[350px] w-[352px]">
              <span className="text-xs text-muted-foreground">Carregando...</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
