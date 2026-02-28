"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Award, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Database } from "@/lib/supabase/types";

type CulturaRow = Database["public"]["Tables"]["cultura_items"]["Row"];

interface ReconhecimentoCardProps {
  item: CulturaRow;
  onClick?: (item: CulturaRow) => void;
}

export function ReconhecimentoCard({ item, onClick }: ReconhecimentoCardProps) {
  const metadata = (item.metadata || {}) as Record<string, unknown>;
  const recipientName = (metadata.recipient_name as string) || "";
  const initials = recipientName
    ? recipientName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <Card
      className="group hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={() => onClick?.(item)}
    >
      <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2 shrink-0">
            <Award className="size-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium">{item.title}</h3>
            {recipientName && (
              <div className="flex items-center gap-2 mt-2">
                <Avatar className="size-5">
                  <AvatarFallback className="text-[10px]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {recipientName}
                </span>
              </div>
            )}
            {item.content_html && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                {stripHtml(item.content_html).slice(0, 150)}
              </p>
            )}
            <div className="flex items-center justify-between mt-3">
              <span className="text-[11px] text-muted-foreground">
                {item.created_at &&
                  format(new Date(item.created_at), "dd MMM yyyy", {
                    locale: ptBR,
                  })}
              </span>
              <Heart className="size-3.5 text-muted-foreground/50 group-hover:text-red-400 transition-colors" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}
