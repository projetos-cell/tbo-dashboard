"use client";

import { useState } from "react";
import { Plus, Award, TrendingUp, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecognitionFeedCard } from "@/features/cultura/components/recognition-feed-card";
import { RecognitionForm } from "@/features/cultura/components/recognition-form";
import { TierProgress } from "@/features/cultura/components/tier-progress";
import { ErrorState } from "@/components/shared";
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

export default function ReconhecimentosPage() {
  const { user, tenantId, role } = useAuthStore();
  const canManage = role === "founder" || role === "diretoria";
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState("feed");

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
  const userMap = new Map((peopleList as { id: string; full_name?: string | null; email?: string | null }[]).map((p) => [p.id, p.full_name ?? p.email ?? p.id]));

  const handleSubmit = async (data: {
    to_user: string;
    value_id: string;
    value_name: string;
    value_emoji: string;
    message: string;
  }) => {
    await createRecognition.mutateAsync({
      tenant_id: tenantId!,
      from_user: user!.id,
      to_user: data.to_user,
      value_id: data.value_id,
      value_name: data.value_name,
      value_emoji: data.value_emoji,
      message: data.message,
      points: role === "founder" ? 2 : 1,
      source: "manual",
      reviewed: true,
    } as Database["public"]["Tables"]["recognitions"]["Insert"]);
    setShowForm(false);
  };

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Reconhecimentos</h1>
          <p className="text-sm text-gray-500">
            Reconheca colegas pelos valores da empresa.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="size-4 mr-1" />
          Reconhecer
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Award className="size-3.5" />
              Total
            </div>
            <p className="text-2xl font-bold">{kpis?.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <TrendingUp className="size-3.5" />
              Este mes
            </div>
            <p className="text-2xl font-bold">{kpis?.thisMonth ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Users className="size-3.5" />
              Media/pessoa
            </div>
            <p className="text-2xl font-bold">{kpis?.avgPerPerson ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Zap className="size-3.5" />
              Fireflies
            </div>
            <p className="text-2xl font-bold">{kpis?.firefliesCount ?? 0}</p>
            {(kpis?.pendingReview ?? 0) > 0 && (
              <Badge variant="secondary" className="text-xs mt-1">
                {kpis?.pendingReview} pendentes
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My balance + tier */}
      {balance && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Meus Pontos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-500">Ganhos:</span>{" "}
                <span className="font-semibold text-green-600">{balance.earned}</span>
              </div>
              <div>
                <span className="text-gray-500">Gastos:</span>{" "}
                <span className="font-semibold text-amber-600">{balance.spent}</span>
              </div>
              <div>
                <span className="text-gray-500">Saldo:</span>{" "}
                <span className="font-bold">{balance.balance}</span>
              </div>
            </div>
            <TierProgress points={balance.earned} />
          </CardContent>
        </Card>
      )}

      {/* Tabs: Feed | Pending Review | Ranking */}
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

        {/* Feed tab */}
        <TabsContent value="feed" className="space-y-3 mt-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)
          ) : recognitions.length > 0 ? (
            recognitions.map((r) => (
              <RecognitionFeedCard
                key={r.id}
                recognition={r}
                fromName={userMap.get(r.from_user)}
                toName={userMap.get(r.to_user)}
                onLike={(id) => likeRecognition.mutate(id)}
                onDelete={(id) => {
                  if (window.confirm("Excluir este reconhecimento?")) {
                    deleteRecognition.mutate(id);
                  }
                }}
                canDelete={canManage}
              />
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Award className="size-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum reconhecimento ainda.</p>
              <p className="text-xs">Seja o primeiro a reconhecer um colega!</p>
            </div>
          )}
        </TabsContent>

        {/* Pending review tab */}
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
                    onClick={() => reviewRecognition.mutate({ id: r.id, approved: true })}
                  >
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => reviewRecognition.mutate({ id: r.id, approved: false })}
                  >
                    Rejeitar
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              Nenhum reconhecimento pendente de revisao.
            </div>
          )}
        </TabsContent>

        {/* Ranking tab */}
        <TabsContent value="top" className="mt-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Top Reconhecidos</CardTitle>
            </CardHeader>
            <CardContent>
              {(kpis?.topRecognized ?? []).length > 0 ? (
                <div className="space-y-2">
                  {kpis!.topRecognized.map((item, idx) => (
                    <div
                      key={item.user_id}
                      className="flex items-center justify-between text-sm py-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-4">{idx + 1}.</span>
                        <span className="font-medium">
                          {userMap.get(item.user_id) ?? item.user_id.slice(0, 8)}
                        </span>
                      </div>
                      <Badge variant="secondary">{item.count} reconhecimentos</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum dado ainda.</p>
              )}
            </CardContent>
          </Card>

          {/* By value breakdown */}
          {(kpis?.byValue ?? []).length > 0 && (
            <Card className="mt-3">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Por Valor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {kpis!.byValue.map((v) => (
                    <div
                      key={v.value_id}
                      className="flex items-center justify-between text-sm py-1"
                    >
                      <span>
                        {v.value_emoji} {v.value_name}
                      </span>
                      <Badge variant="outline">{v.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Recognition form dialog */}
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
  );
}
