"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ChannelItem, type ChannelItemProps } from "./channel-list-item";

interface DraggableChannelItemProps extends ChannelItemProps {
  canDrag?: boolean;
}

export function DraggableChannelItem({
  canDrag = false,
  ...props
}: DraggableChannelItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: props.channel.id,
      disabled: !canDrag,
    });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn("relative group/drag", isDragging && "opacity-50")}
    >
      {canDrag && (
        <span
          {...attributes}
          {...listeners}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center opacity-0 group-hover/drag:opacity-40 hover:!opacity-80 cursor-grab active:cursor-grabbing touch-none p-1 text-muted-foreground"
        >
          <IconGripVertical size={10} />
        </span>
      )}
      <div className={cn(canDrag && "pl-3")}>
        <ChannelItem {...props} />
      </div>
    </div>
  );
}
