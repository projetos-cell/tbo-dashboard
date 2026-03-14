"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { IconPlus, IconAward, IconSearch, IconX, IconCalendar, IconStar } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useRecognitionsRealtime,
} from "@/features/cultura/hooks/use-reconhecimentos";
import { usePeople } from "@/features/people/hooks/use-people";
import { useAuthStore } from "@/stores/auth-store";
import { TBO_VALUES } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

export default function ReconhecimentosPage() {
  const { user, tenantId, role } = useAuthStore();
  const canManage = role === "founder" || role === "diretoria";
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState("feed");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Search/filter state
  const [search, setSearch] = useState("");
  const [filterPerson, setFilterPerson] = useState("all");
  const [filterValue, setFilterValue] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");

  // Realtime subscription
  useRecognitionsRealtime();

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

  // Client-side filter
  const filteredRecognitions = useMemo(() => {
    let result = recognitions;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.message?.toLowerCase().includes(q) ||
          userMap.get(r.from_user)?.toLowerCase().includes(q) ||
          userMap.get(r.to_user)?.toLowerCase().includes(q) ||
          r.value_name?.toLowerCase().includes(q)
      );
    }
    if (filterPerson !== "all") {
      result = result.filter(
        (r) => r.from_user === filterPerson || r.to_user === filterPerson
      );
    }
    if (filterValue !== "all") {
      result = result.filter((r) => r.value_id === filterValue);
    }
    if (filterPeriod !== "all") {
      const days = parseInt(filterPeriod, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter((r) => r.created_at && new Date(r.created_at) >= cutoff);
    }
    return result;
  }, [recognitions, search, filterPerson, filterValue, filterPeriod, userMap]);

  const hasActiveFilters = search.trim() || filterPerson !== "all" || filterValue !== "all" || filterPeriod !== "all";

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
        points: role === "founder" ? 2 : 1,
        source: "manual",
        reviewed: true,
      } as Database["public"]["Tables"]["recognitions"]["Insert"]);
      setShowForm(false);
      toast.success("Reconhecimento enviado! 🎉");
    } catch {
      // handled by mutation onError
    }
  };

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Reconhecimentos</h1>
          <p className="text-sm text-gray-500">
            Reconheça colegas pelos valores da empresa.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {balance !== undefined && (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-full px-2.5 py-1">
              <IconStar className="size-3 fill-current" />
              <span className="font-medium">{balance.balance ?? 0} pts</span>
            </div>
          )}
          <Button size="sm" onClick={() => setShowForm(true)}>
            <IconPlus className="size-4 mr-1" />
            Reconhecer
          </Button>
        </div>
      </div>

      <RecognitionKPISection kpis={kpis} balance={balance} />

      {/* Search & filter bar */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
          <Input
            placeholder="Buscar por mensagem, pessoa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <IconX className="size-3.5" />
            </button>
          )}
        </div>
        <Select value={filterPerson} onValueChange={setFilterPerson}>
          <SelectTrigger className="w-40 h-8 text-sm">
            <SelectValue placeholder="Pessoa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as pessoas</SelectItem>
            {(peopleList as { id: string; full_name?: string | null; email?: string | null }[]).map(
              (p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.full_name ?? p.email ?? p.id}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        <Select value={filterValue} onValueChange={setFilterValue}>
          <SelectTrigger className="w-40 h-8 text-sm">
            <SelectValue placeholder="Valor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os valores</SelectItem>
            {TBO_VALUES.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.emoji} {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPeriod} onValueChange={setFilterPeriod}>
          <SelectTrigger className="w-36 h-8 text-sm">
            <IconCalendar className="size-3.5 mr-1 text-gray-400" />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os períodos</SelectItem>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-gray-500"
            onClick={() => {
              setSearch("");
              setFilterPerson("all");
              setFilterValue("all");
              setFilterPeriod("all");
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

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
          ) : filteredRecognitions.length > 0 ? (
            filteredRecognitions.map((r) => (
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
          ) : hasActiveFilters ? (
            <EmptyState
              icon={IconSearch}
              title="Nenhum resultado encontrado"
              description="Tente ajustar os filtros ou limpar a busca."
              cta={{ label: "Limpar filtros", onClick: () => { setSearch(""); setFilterPerson("all"); setFilterValue("all"); } }}
            />
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
            <EmptyState
              icon={IconAward}
              title="Nenhum reconhecimento pendente"
              description="Todos os reconhecimentos foram revisados."
            />
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
  );
}
