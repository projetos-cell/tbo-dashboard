"use client";

import {
  IconCheckbox,
  IconCheck,
  IconX,
  IconRotate,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useContentApprovals, useUpdateApprovalStatus } from "@/features/marketing/hooks/use-marketing-content";

const APPROVAL_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pendente", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  approved: { label: "Aprovado", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  rejected: { label: "Rejeitado", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  revision: { label: "Revisao", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
};

function AprovacoesContent() {
  const { data: approvals, isLoading, error, refetch } = useContentApprovals();
  const updateStatus = useUpdateApprovalStatus();

  const pending = (approvals ?? []).filter((a) => a.status === "pending");
  const others = (approvals ?? []).filter((a) => a.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Aprovacoes</h1>
        <p className="text-sm text-muted-foreground">Workflow de revisao e aprovacao de conteudo.</p>
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar aprovacoes." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
      ) : !approvals || approvals.length === 0 ? (
        <EmptyState icon={IconCheckbox} title="Nenhuma aprovacao pendente" description="Aprovacoes de conteudo aparecerao aqui." />
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pendentes ({pending.length})</h2>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Conteudo</th>
                      <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Submetido</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pending.map((a) => (
                      <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{a.content_title}</td>
                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                          {new Date(a.submitted_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" className="h-7 text-green-600" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ id: a.id, status: "approved" })}>
                              <IconCheck className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-amber-600" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ id: a.id, status: "revision" })}>
                              <IconRotate className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-red-600" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ id: a.id, status: "rejected" })}>
                              <IconX className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {others.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Historico ({others.length})</h2>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Conteudo</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                      <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Revisor</th>
                      <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {others.map((a) => {
                      const st = APPROVAL_STATUS[a.status];
                      return (
                        <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{a.content_title}</td>
                          <td className="px-4 py-3">
                            {st ? <Badge variant="secondary" style={{ backgroundColor: st.bg, color: st.color }}>{st.label}</Badge> : a.status}
                          </td>
                          <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{a.reviewer_name ?? "--"}</td>
                          <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">{a.reviewed_at ? new Date(a.reviewed_at).toLocaleDateString("pt-BR") : "--"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AprovacoesPage() {
  return (
    <RequireRole module="marketing">
      <AprovacoesContent />
    </RequireRole>
  );
}
