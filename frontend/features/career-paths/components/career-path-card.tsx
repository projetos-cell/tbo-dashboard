"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CareerPathWithMemberCount } from "@/features/career-paths/services/career-paths";

interface CareerPathCardProps {
  path: CareerPathWithMemberCount;
}

export function CareerPathCard({ path }: CareerPathCardProps) {
  return (
    <Link href={`/pessoas/carreira/${path.id}`} className="group block">
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-orange-200 group-hover:-translate-y-0.5">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{path.icon ?? "🏢"}</span>
              <div>
                <h3 className="font-semibold text-base leading-tight">{path.name}</h3>
                {path.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {path.description}
                  </p>
                )}
              </div>
            </div>
            <Badge variant="secondary" className="shrink-0 gap-1">
              <Users className="h-3 w-3" />
              {path.member_count}
            </Badge>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-gray-400" />
              Base
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Gestão
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              Técnica
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
