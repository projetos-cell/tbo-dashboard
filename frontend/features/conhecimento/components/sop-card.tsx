"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconArrowRight,
  IconClock,
  IconUser,
} from "@tabler/icons-react";
import type { SOP } from "../types/sops";
import { SOP_STATUS_CONFIG, SOP_PRIORITY_CONFIG, SOP_CATEGORY_CONFIG } from "../types/sops";

interface SOPCardProps {
  sop: SOP;
  href?: string;
}

export function SOPCard({ sop, href }: SOPCardProps) {
  const statusCfg = SOP_STATUS_CONFIG[sop.status];
  const priorityCfg = SOP_PRIORITY_CONFIG[sop.priority];
  const categoryCfg = SOP_CATEGORY_CONFIG[sop.category];

  const content = (
    <Card className="h-full transition-colors group-hover:border-tbo-orange/40 cursor-pointer">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm truncate">{sop.title}</h3>
            {sop.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {sop.description}
              </p>
            )}
          </div>
          <IconArrowRight className="size-4 text-muted-foreground group-hover:text-tbo-orange transition-colors shrink-0 mt-0.5" />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0"
            style={{ borderColor: statusCfg.color === "green" ? "#22c55e" : undefined }}
          >
            {statusCfg.label}
          </Badge>
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0"
          >
            {categoryCfg.label}
          </Badge>
          {sop.priority !== "medium" && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0"
            >
              {priorityCfg.label}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <IconClock className="size-3" />
            v{sop.version}
          </span>
          {sop.tags.length > 0 && (
            <span className="truncate">
              {sop.tags.slice(0, 2).join(", ")}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="group">
        {content}
      </Link>
    );
  }

  return <div className="group">{content}</div>;
}
