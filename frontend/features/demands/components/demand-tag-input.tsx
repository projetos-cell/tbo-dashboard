"use client";

import * as React from "react";
import { IconX, IconPlus } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

interface DemandTagInputProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder?: string;
}

export function DemandTagInput({
  tags,
  onAdd,
  onRemove,
  placeholder = "+ tag",
}: DemandTagInputProps) {
  const [draft, setDraft] = React.useState("");

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onAdd(trimmed);
    }
    setDraft("");
  };

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className="text-[10px] gap-0.5 pr-1"
        >
          {tag}
          <button
            type="button"
            onClick={() => onRemove(tag)}
            className="ml-0.5 hover:text-destructive transition-colors"
          >
            <IconX className="size-2.5" />
          </button>
        </Badge>
      ))}
      <div className="flex items-center gap-0.5">
        <input
          type="text"
          className="w-16 text-[10px] border rounded px-1 py-0.5 bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
        />
        {draft.trim() && (
          <button type="button" onClick={commit}>
            <IconPlus className="size-3 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        )}
      </div>
    </div>
  );
}
