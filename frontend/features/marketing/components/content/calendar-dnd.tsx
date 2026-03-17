"use client";

// Features #29 #30 — Calendar DnD primitives (DraggableCard + DroppableCell)

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { MARKETING_CONTENT_STATUS } from "@/lib/constants";
import type { ContentItem, ContentStatus } from "../../types/marketing";

const CHANNEL_COLORS: Record<string, string> = {
  Instagram: "#e1306c",
  Facebook: "#1877f2",
  LinkedIn: "#0a66c2",
  TikTok: "#010101",
  YouTube: "#ff0000",
  Blog: "#f59e0b",
  Email: "#6366f1",
  WhatsApp: "#25d366",
  Twitter: "#1da1f2",
};

interface DraggableCardProps {
  item: ContentItem;
}

export function DraggableCard({ item }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;
  const statusDef = MARKETING_CONTENT_STATUS[item.status as ContentStatus];
  const channelColor = item.channel ? CHANNEL_COLORS[item.channel] : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`text-[11px] rounded px-1.5 py-0.5 truncate cursor-grab select-none border transition-opacity ${
        isDragging ? "opacity-40 z-50" : "opacity-100"
      }`}
      style={{
        ...style,
        backgroundColor: statusDef?.bg ?? "rgba(99,102,241,0.1)",
        borderColor: (statusDef?.color ?? "#6366f1") + "40",
        color: statusDef?.color ?? "#6366f1",
        borderLeftColor: channelColor ?? statusDef?.color ?? "#6366f1",
        borderLeftWidth: 2,
      }}
      title={item.title}
    >
      {item.title}
    </div>
  );
}

interface DroppableCellProps {
  dateStr: string; // "yyyy-MM-dd"
  dayNumber: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  items: ContentItem[];
  onNewItem: (dateStr: string) => void;
}

export function DroppableCell({
  dateStr,
  dayNumber,
  isToday,
  isCurrentMonth,
  items,
  onNewItem,
}: DroppableCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id: dateStr });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[90px] p-1 border-r border-b relative group transition-colors ${
        isOver ? "bg-purple-50 dark:bg-purple-950/20" : ""
      } ${!isCurrentMonth ? "opacity-40" : ""}`}
    >
      <div className="flex items-center justify-between mb-0.5">
        <span
          className={`text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full ${
            isToday
              ? "bg-purple-600 text-white font-bold"
              : "text-muted-foreground"
          }`}
        >
          {dayNumber}
        </span>
        <button
          type="button"
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground text-lg leading-none transition-opacity"
          onClick={() => onNewItem(dateStr)}
          title="Novo conteúdo neste dia"
        >
          +
        </button>
      </div>
      <div className="space-y-0.5 overflow-hidden">
        {items.slice(0, 4).map((item) => (
          <DraggableCard key={item.id} item={item} />
        ))}
        {items.length > 4 && (
          <Badge variant="outline" className="text-[10px] h-4 px-1">
            +{items.length - 4} mais
          </Badge>
        )}
      </div>
    </div>
  );
}
