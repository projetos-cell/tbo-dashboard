"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconPlus,
  IconDots,
  IconUsers,
  IconHeart,
  IconFileText,
  IconCalendarClock,
  IconPencil,
  IconTrash,
  IconChartBar,
  IconRefresh,
  IconSettings2,
  IconCircleCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RequireRole } from "@/features/auth/components/require-role";
import { useRsmAccounts, useRsmPosts, useRsmIdeas, useDeleteRsmPost, useDeleteRsmIdea } from "@/hooks/use-rsm";
import { computeRsmKPIs } from "@/services/rsm";
import { ErrorState, EmptyState } from "@/components/shared";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useSyncInstagram, useInstagramSyncStatus } from "@/hooks/use-instagram-sync";
import { InstagramConfigDialog } from "./_components/instagram-config-dialog";
import { formatDistanceToNow } from "date-fns";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-800",
  facebook: "bg-blue-100 text-blue-800",
  linkedin: "bg-sky-100 text-sky-800",
  tiktok: "bg-slate-100 text-slate-800",
  youtube: "bg-red-100 text-red-800",
  twitter: "bg-cyan-100 text-cyan-800",
  x: "bg-slate-100 text-slate-800",
};

const POST_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  scheduled: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

const IDEA_STATUS_COLORS: Record<string, string> = {
  nova: "bg-blue-100 text-blue-800",
  aprovada: "bg-green-100 text-green-800",
  rejeitada: "bg-red-100 text-red-800",
  em_producao: "bg-yellow-100 text-yellow-800",
  publicada: "bg-emerald-100 text-emerald-800",
};

export default function RsmPage() {
  const router = useRouter();
  const [tab, setTab] = useState("contas");
  const [postStatusFilter, setPostStatusFilter] = useState("all");
  const [ideaStatusFilter, setIdeaStatusFilter] = useState("all");
  const [configOpen, setConfigOpen] = useState(false);
  const [pendingDeletePost, setPendingDeletePost] = useState<string | null>(null);
  const [pendingDeleteIdea, setPendingDeleteIdea] = useState<string | null>(null);

  // Instagram sync
  const syncMutation = useSyncInstagram();
  const { data: syncStatus } = useInstagramSyncStatus();

  // Queries
  const { data: accounts = [], isLoading: loadingAccounts, error: accountsError, refetch: refetchAccounts } = useRsmAccounts();
  const { data: posts = [], isLoading: loadingPosts, error: postsError, refetch: refetchPosts } = useRsmPosts(
    postStatusFilter !== "all" ? { status: postStatusFilter } : undefined
  );
  const { data: ideas = [], isLoading: loadingIdeas, error: ideasError, refetch: refetchIdeas } = useRsmIdeas(
    ideaStatusFilter !== "all" ? { status: ideaStatusFilter } : undefined
  );

  const primaryError = accountsError || postsError || ideasError;
  const primaryRefetch = () => {
    refetchAccounts();
    refetchPosts();
    refetchIdeas();
  };

  // Mutations
  const deletePostMutation = useDeleteRsmPost();
  const deleteIdeaMutation = useDeleteRsmIdea();

  // KPIs
  const { data: allPosts = [] } = useRsmPosts();
  const kpis = useMemo(
    () => computeRsmKPIs(accounts, allPosts),
    [accounts, allPosts]
  );

  return (
    <RequireRole module="rsm">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Social Media</h1>
            <p className="text-sm text-gray-500">
              Gerencie contas, posts e ideias de redes sociais.
            </p>
            {syncStatus && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                {syncStatus.status === "success" ? (
                  <IconCircleCheck className="h-3 w-3 text-green-500" />
                ) : syncStatus.status === "error" ? (
                  <IconAlertCircle className="h-3 w-3 text-red-500" />
                ) : null}
                <span>
                  Ultimo sync:{" "}
                  {formatDistanceToNow(new Date(syncStatus.finished_at ?? syncStatus.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfigOpen(true)}
            >
              <IconSettings2 className="mr-1.5 h-4 w-4" />
              Config
            </Button>
            <Button
              size="sm"
              onClick={() => syncMutation.mutate(7)}
              disabled={syncMutation.isPending}
            >
              <IconRefresh className={`mr-1.5 h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
              {syncMutation.isPending ? "Sincronizando..." : "Sync Instagram"}
            </Button>
          </div>
        </div>

        <InstagramConfigDialog open={configOpen} onOpenChange={setConfigOpen} />

        {primaryError && (
          <ErrorState message={primaryError.message} onRetry={primaryRefetch} />
        )}

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contas Ativas</CardTitle>
              <IconUsers className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalAccounts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Seguidores</CardTitle>
              <IconHeart className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpis.totalFollowers.toLocaleString("pt-BR")}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posts este Mes</CardTitle>
              <IconFileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.postsThisMonth}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendados</CardTitle>
              <IconCalendarClock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.scheduledPosts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="contas">Contas</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="ideias">Ideias</TabsTrigger>
          </TabsList>

          {/* ── Tab: Contas ───────────────────────────────── */}
          <TabsContent value="contas" className="space-y-4">
            {loadingAccounts ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            ) : accounts.length === 0 ? (
              <EmptyState
                icon={IconChartBar}
                title="Nenhuma conta cadastrada"
                description="Adicione contas de redes sociais para gerenciar sua presença digital."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => (
                  <Card
                    key={account.id}
                    className="cursor-pointer transition-shadow hover:shadow-md hover:ring-1 hover:ring-border"
                    onClick={() => router.push(`/rsm/${account.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className={
                            PLATFORM_COLORS[account.platform.toLowerCase()] ??
                            "bg-gray-100 text-gray-800"
                          }
                        >
                          {account.platform}
                        </Badge>
                        <Badge variant={account.is_active ? "default" : "outline"}>
                          {account.is_active ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                      <CardTitle className="text-base">@{account.handle}</CardTitle>
                      <CardDescription>
                        {account.profile_url ?? "Sem URL de perfil"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold text-gray-900">
                          {(account.followers_count ?? 0).toLocaleString("pt-BR")}
                        </span>{" "}
                        seguidores
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Tab: Posts ─────────────────────────────────── */}
          <TabsContent value="posts" className="space-y-4">
            <div className="flex items-center justify-between">
              <Select
                value={postStatusFilter}
                onValueChange={setPostStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                </SelectContent>
              </Select>
              <Button className="ml-3 shrink-0">
                <IconPlus className="mr-1.5 h-4 w-4" />
                Novo Post
              </Button>
            </div>

            {loadingPosts ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <EmptyState
                icon={IconChartBar}
                title="Nenhum post encontrado"
                description="Crie o primeiro post para publicar nas redes sociais."
              />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titulo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Publicado</TableHead>
                      <TableHead>Agendado</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">
                          {post.title ?? "(Sem titulo)"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{post.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              POST_STATUS_COLORS[post.status] ??
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {post.published_date
                            ? format(new Date(post.published_date), "dd/MM/yyyy", {
                                locale: ptBR,
                              })
                            : "-"}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {post.scheduled_date
                            ? format(new Date(post.scheduled_date), "dd/MM/yyyy", {
                                locale: ptBR,
                              })
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <IconDots className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <IconPencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => setPendingDeletePost(post.id)}
                              >
                                <IconTrash className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* ── Tab: Ideias ────────────────────────────────── */}
          <TabsContent value="ideias" className="space-y-4">
            <div className="flex items-center justify-between">
              <Select
                value={ideaStatusFilter}
                onValueChange={setIdeaStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="nova">Nova</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="rejeitada">Rejeitada</SelectItem>
                  <SelectItem value="em_producao">Em Producao</SelectItem>
                  <SelectItem value="publicada">Publicada</SelectItem>
                </SelectContent>
              </Select>
              <Button className="ml-3 shrink-0">
                <IconPlus className="mr-1.5 h-4 w-4" />
                Nova Ideia
              </Button>
            </div>

            {loadingIdeas ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded" />
                ))}
              </div>
            ) : ideas.length === 0 ? (
              <EmptyState
                icon={IconChartBar}
                title="Nenhuma ideia encontrada"
                description="Registre ideias de conteúdo para transformar em posts."
              />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titulo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Responsavel</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ideas.map((idea) => (
                      <TableRow key={idea.id}>
                        <TableCell className="font-medium">
                          {idea.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{idea.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              IDEA_STATUS_COLORS[idea.status] ??
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            {idea.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {idea.assigned_to ?? "-"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <IconDots className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <IconPencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => setPendingDeleteIdea(idea.id)}
                              >
                                <IconTrash className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <ConfirmDialog
          open={pendingDeletePost !== null}
          onOpenChange={(open) => { if (!open) setPendingDeletePost(null); }}
          title="Excluir post"
          description="Tem certeza que deseja excluir este post? Esta acao nao pode ser desfeita."
          confirmLabel="Excluir"
          onConfirm={() => {
            if (pendingDeletePost) deletePostMutation.mutate(pendingDeletePost);
            setPendingDeletePost(null);
          }}
        />

        <ConfirmDialog
          open={pendingDeleteIdea !== null}
          onOpenChange={(open) => { if (!open) setPendingDeleteIdea(null); }}
          title="Excluir ideia"
          description="Tem certeza que deseja excluir esta ideia? Esta acao nao pode ser desfeita."
          confirmLabel="Excluir"
          onConfirm={() => {
            if (pendingDeleteIdea) deleteIdeaMutation.mutate(pendingDeleteIdea);
            setPendingDeleteIdea(null);
          }}
        />
      </div>
    </RequireRole>
  );
}
