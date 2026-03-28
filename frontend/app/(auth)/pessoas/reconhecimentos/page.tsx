"use client";

import { useState } from "react";
import { IconAward, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecognitionFeedCard } from "@/features/cultura/components/recognition-feed-card";
import { RecognitionForm } from "@/features/cultura/components/recognition-form";
import { RecognitionRanking } from "@/features/cultura/components/recognition-ranking";
import { RecognitionKPISection } from "@/features/cultura/components/recognition-kpi-section";
import { ErrorState, ConfirmDialog, EmptyState } from "@/components/shared";
import {
  useRecognitions,
  useRecognitionKPIs,
  usePointsBalance,
  useCreateRecognition,
  useLikeRecognition,
  useDeleteRecognition,
  useUnreviewedRecognitions,
  useReviewRecognition,
  useCheckRateLimit,
} from "@/features/cultura/hooks/use-reconhecimentos";
import { usePeople } from "@/features/people/hooks/use-people";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";
import { RBACGuard } from "@/components/rbac-guard";

export default function PessoasReconhecimentosPage() {
  const { user, tenantId, role } = useAuthStore();
  const canManage = role === "admin";
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState("feed");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const { data: recognitionsData, isLoading, error, refetch } = useRecognitions({ limit: 50 });
  const { data: kpis } = useRecognitionKPIs();
  const { data: balance } = usePointsBalance(user?.id);
  const { data: unreviewed } = useUnreviewedRecognitions();
  const { data: rateLimit } = useCheckRateLimit(user?.id);
  const { data: people } = usePeople();

  const createRecognition = useCreateRecognition();
  const likeRecognition = useLikeRecognition();
  const deleteRecognition = useDeleteRecognition();
  const reviewRecognition = useReviewRecognition();

  const recognitions = recognitionsData?.data ?? [];
  const peopleList = people?.data ?? people ?? [];
  const userMap = new Map(
    (peopleList as { id: string; full_name?: string | null; email?: string | null }[]).map((p) => [
      p.id,
      p.full_name ?? p.email ?? p.id,
    ])
  );

  const handleSubmit = async (data: {
    to_user: string;
    value_id: string;
    value_name: string;
    value_emoji: string;
    message: string;
  }) => {
    try {
      await createRecognition.mutateAsync({
        tenant_id: tenantId!,
        from_user: user!.id,
        to_user: data.to_user,
        value_id: data.value_id,
        value_name: data.value_name,
        value_emoji: data.value_emoji,
        message: data.message,
        points: role === "admin" ? 2 : 1,
        source: "manual",
        reviewed: true,
      } as Database["public"]["Tables"]["recognitions"]["Insert"]);
      setShowForm(false);
    } catch {
      // handled by mutation onError
    }
  };

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  }

  return (
    <RBACGuard minRole="colaborador">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Reconhecimentos</h1>
          <p className="text-sm text-gray-500">
            Reconheça colegas pelos valores da empresa.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <IconPlus className="size-4 mr-1" />
          Reconhecer
        </Button>
      </div>

      <RecognitionKPISection kpis={kpis} balance={balance} />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="feed">Feed</TabsTrigger>
          {canManage && (
            <TabsTrigger value="pending">
              Pendentes
              {(unreviewed?.length ?? 0) > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs">
                  {unreviewed?.length}
                </Badge>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="top">Ranking</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-3 mt-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex gap-3">
                  <Skeleton className="size-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-3" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : recognitions.length > 0 ? (
            recognitions.map((r) => (
              <RecognitionFeedCard
                key={r.id}
                recognition={r}
                fromName={userMap.get(r.from_user)}
                toName={userMap.get(r.to_user)}
                onLike={(id) => likeRecognition.mutate(id)}
                onDelete={(id) => setDeletingId(id)}
                canDelete={canManage}
              />
            ))
          ) : (
            <EmptyState
              icon={IconAward}
              title="Nenhum reconhecimento ainda"
              description="Seja o primeiro a reconhecer um colega!"
              cta={{ label: "Reconhecer", onClick: () => setShowForm(true) }}
            />
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-3 mt-3">
          {(unreviewed ?? []).length > 0 ? (
            (unreviewed ?? []).map((r) => (
              <div key={r.id} className="space-y-2">
                <RecognitionFeedCard
                  recognition={r}
                  fromName={userMap.get(r.from_user)}
                  toName={userMap.get(r.to_user)}
                />
                <div className="flex gap-2 pl-4">
                  <Button
                    size="sm"
                    variant="default"
                    disabled={reviewingId === r.id}
                    onClick={async () => {
                      setReviewingId(r.id);
                      try {
                        await reviewRecognition.mutateAsync({ id: r.id, approved: true });
                      } finally {
                        setReviewingId(null);
                      }
                    }}
                  >
                    {reviewingId === r.id ? "Aprovando..." : "Aprovar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={reviewingId === r.id}
                    onClick={async () => {
                      setReviewingId(r.id);
                      try {
                        await reviewRecognition.mutateAsync({ id: r.id, approved: false });
                      } finally {
                        setReviewingId(null);
                      }
                    }}
                  >
                    {reviewingId === r.id ? "Rejeitando..." : "Rejeitar"}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              Nenhum reconhecimento pendente de revisão.
            </div>
          )}
        </TabsContent>

        <TabsContent value="top" className="mt-3">
          <RecognitionRanking
            topRecognized={kpis?.topRecognized ?? []}
            byValue={kpis?.byValue ?? []}
            userMap={userMap}
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Excluir reconhecimento?"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={async () => {
          try {
            if (deletingId) await deleteRecognition.mutateAsync(deletingId);
          } catch {
            // handled by mutation onError
          } finally {
            setDeletingId(null);
          }
        }}
      />

      <RecognitionForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={handleSubmit}
        users={(peopleList as { id: string; full_name?: string | null; email?: string | null }[]).map((p) => ({
          id: p.id,
          name: p.full_name ?? p.email ?? p.id,
        }))}
        currentUserId={user?.id ?? ""}
        rateLimitInfo={rateLimit}
        isSubmitting={createRecognition.isPending}
      />
    </div>
    </RBACGuard>
  );
}
