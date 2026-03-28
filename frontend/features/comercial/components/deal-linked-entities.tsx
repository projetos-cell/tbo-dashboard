"use client";

import { Badge } from "@/components/ui/badge";
import {
  IconLink,
  IconFolder,
  IconFileText,
  IconArrowRight,
} from "@tabler/icons-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

// ── Linked Project & Contract ────────────────────────────

interface DealLinkedEntitiesProps {
  dealId: string;
  company: string | null;
}

export function DealLinkedEntities({ dealId, company }: DealLinkedEntitiesProps) {
  const { data } = useQuery({
    queryKey: ["deal-linked", dealId],
    queryFn: async () => {
      const supabase = createClient();

      // Find project linked via deal_id or legacy name match
      const { data: projects } = await supabase
        .from("projects")
        .select("id, name, code, status")
        .or(`deal_id.eq.${dealId},and(source.eq.deal_automation,name.ilike.%${company ?? "___NOMATCH___"}%)`)
        .order("created_at", { ascending: false })
        .limit(1);

      // Find contract linked
      const { data: contracts } = await supabase
        .from("contracts")
        .select("id, title, status, project_name")
        .ilike("project_name", `%${company ?? "___NOMATCH___"}%`)
        .order("created_at", { ascending: false })
        .limit(1);

      return {
        project: (projects as unknown as Array<{ id: string; name: string; code: string | null; status: string }> | null)?.[0] ?? null,
        contract: (contracts as unknown as Array<{ id: string; title: string; status: string }> | null)?.[0] ?? null,
      };
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!company,
  });

  if (!data?.project && !data?.contract) return null;

  return (
    <section>
      <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
        <IconLink className="h-3.5 w-3.5" strokeWidth={1.5} />
        Vínculos
      </h4>
      <div className="space-y-2">
        {data.project && (
          <Link
            href={`/projetos?id=${data.project.id}`}
            className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3 transition-colors hover:bg-muted/40"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff4ec]">
              <IconFolder className="h-4 w-4 text-[#ff6200]" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Projeto</p>
              <p className="text-sm font-semibold truncate">{data.project.code ?? data.project.name}</p>
            </div>
            <Badge variant="secondary" className="text-[10px] shrink-0">{data.project.status}</Badge>
            <IconArrowRight className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
          </Link>
        )}
        {data.contract && (
          <Link
            href="/contratos"
            className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3 transition-colors hover:bg-muted/40"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <IconFileText className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Contrato</p>
              <p className="text-sm font-semibold truncate">{data.contract.title}</p>
            </div>
            <Badge variant="secondary" className="text-[10px] shrink-0">{data.contract.status}</Badge>
            <IconArrowRight className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
          </Link>
        )}
      </div>
    </section>
  );
}
