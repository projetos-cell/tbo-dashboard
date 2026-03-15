"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface MemberInfo {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface MemberAvatarStackProps {
  members: MemberInfo[];
  max?: number;
  size?: number;
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const COLORS = [
  { bg: "#d1e8fb", text: "#0c447c" },
  { bg: "#faeeda", text: "#633806" },
  { bg: "#eaf3de", text: "#27500a" },
  { bg: "#fbeaf0", text: "#72243e" },
  { bg: "#e1f5ee", text: "#085041" },
  { bg: "#e8e0f5", text: "#4a2174" },
];

export function MemberAvatarStack({
  members,
  max = 5,
  size = 26,
}: MemberAvatarStackProps) {
  const visible = members.slice(0, max);
  const overflow = members.length - max;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center">
        {visible.map((m, i) => {
          const color = COLORS[i % COLORS.length];
          return (
            <Tooltip key={m.id}>
              <TooltipTrigger asChild>
                <Avatar
                  className={cn("border-[1.5px] border-background cursor-pointer")}
                  style={{
                    width: size,
                    height: size,
                    marginLeft: i > 0 ? -6 : 0,
                    zIndex: visible.length - i,
                  }}
                >
                  {m.avatar_url && <AvatarImage src={m.avatar_url} alt={m.full_name ?? ""} />}
                  <AvatarFallback
                    className="text-[9px] font-medium"
                    style={{ backgroundColor: color.bg, color: color.text }}
                  >
                    {getInitials(m.full_name)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {m.full_name ?? "Sem nome"}
              </TooltipContent>
            </Tooltip>
          );
        })}
        {overflow > 0 && (
          <div
            className="flex items-center justify-center rounded-full border-[1.5px] border-background bg-muted text-[9px] font-medium text-muted-foreground"
            style={{ width: size, height: size, marginLeft: -6 }}
          >
            +{overflow}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
