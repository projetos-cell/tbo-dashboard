"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { marked } from "marked";
import {
  ArrowLeft,
  Clock,
  Pencil,
  History,
  CalendarClock,
  Scale,
  Users,
  Briefcase,
  Landmark,
  ShieldCheck,
  FileText,
  BookOpen,
  Settings2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePolicyById, usePolicyRevisions } from "@/features/cultura/hooks/use-policies";
import { PolicyRevisionsList } from "./policy-revisions-list";
import { PolicyMetadataGrid } from "./policy-metadata-grid";
import { POLICY_CATEGORIES, POLICY_STATUS } from "@/lib/constants";
import { sanitizeHtml } from "@/lib/sanitize";

// Configure marked for clean output
marked.setOptions({
  gfm: true,
  breaks: true,
});

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  etica: Scale,
  pessoas: Users,
  comercial: Briefcase,
  governanca: Landmark,
  compliance: ShieldCheck,
};

interface PolicyDetailProps {
  policyId: string;
  onBack: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
}

export function PolicyDetail({
  policyId,
  onBack,
  onEdit,
  canEdit = false,
}: PolicyDetailProps) {
  const { data: policy, isLoading } = usePolicyById(policyId);
  const { data: revisions } = usePolicyRevisions(policyId);

  // Parse markdown to HTML once
  const contentHtml = useMemo(() => {
    if (!policy?.content_md) return "";
    const raw = marked.parse(policy.content_md);
    return sanitizeHtml(typeof raw === "string" ? raw : "");
  }, [policy?.content_md]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Skeleton className="size-8 rounded mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="size-7 rounded-md" />
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
        <Skeleton className="h-3 w-80 ml-11" />
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-[calc(100vh-22rem)] w-full rounded-lg" />
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Politica nao encontrada.</p>
        <Button variant="link" onClick={onBack} className="mt-2">
          Voltar
        </Button>
      </div>
    );
  }

  const catDef =
    POLICY_CATEGORIES[policy.category as keyof typeof POLICY_CATEGORIES];
  const statusDef =
    POLICY_STATUS[policy.status as keyof typeof POLICY_STATUS];
  const Icon = CATEGORY_ICONS[policy.category] || FileText;

  const isOverdue =
    policy.next_review_at && new Date(policy.next_review_at) < new Date();

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Voltar"
          className="mt-0.5 shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className="flex items-center justify-center size-7 rounded-md shrink-0"
              style={{ backgroundColor: catDef?.bg || "#f5f5f5" }}
            >
              <Icon
                className="size-3.5"
                style={{ color: catDef?.color || "#888" }}
              />
            </div>
            <h1 className="text-lg font-semibold leading-tight truncate">
              {policy.title}
            </h1>
            {catDef && (
              <Badge
                variant="outline"
                className="text-[10px]"
                style={{ color: catDef.color, borderColor: catDef.color }}
              >
                {catDef.label}
              </Badge>
            )}
            {statusDef && (
              <Badge
                variant="outline"
                className="text-[10px]"
                style={{ color: statusDef.color, borderColor: statusDef.color }}
              >
                {statusDef.label}
              </Badge>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[11px] text-gray-500">
            <span className="font-medium">v{policy.version}</span>
            {policy.updated_at && (
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {format(new Date(policy.updated_at), "dd MMM yyyy", {
                  locale: ptBR,
                })}
              </span>
            )}
            {policy.next_review_at && (
              <span
                className={`flex items-center gap-1 ${
                  isOverdue ? "text-red-500 font-medium" : ""
                }`}
              >
                <CalendarClock className="size-3" />
                Revisao{" "}
                {format(new Date(policy.next_review_at), "dd/MM/yyyy")}
                {isOverdue && " (atrasada)"}
              </span>
            )}
          </div>
        </div>

        {canEdit && onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="shrink-0"
          >
            <Pencil className="size-3.5 mr-1.5" />
            Editar
          </Button>
        )}
      </div>

      {policy.summary && (
        <p className="text-sm text-gray-500 -mt-1 pl-11">
          {policy.summary}
        </p>
      )}

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="visao" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-fit">
          <TabsTrigger value="visao" className="gap-1.5">
            <BookOpen className="size-3.5" />
            Conteudo
          </TabsTrigger>
          <TabsTrigger value="revisoes" className="gap-1.5">
            <History className="size-3.5" />
            Revisoes
            {revisions && revisions.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 text-[10px] px-1.5 py-0"
              >
                {revisions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-1.5">
            <Settings2 className="size-3.5" />
            Detalhes
          </TabsTrigger>
        </TabsList>

        {/* Content tab — Scrollable Content pattern */}
        <TabsContent value="visao" className="flex-1 min-h-0 mt-3">
          <Card className="h-[calc(100vh-22rem)] flex flex-col">
            <CardContent className="flex-1 min-h-0 p-0">
              {contentHtml ? (
                <ScrollArea className="h-full">
                  <div className="p-6">
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none
                        prose-headings:font-semibold prose-headings:tracking-tight
                        prose-h2:text-base prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b
                        prose-h3:text-sm prose-h3:mt-6 prose-h3:mb-2
                        prose-p:leading-relaxed prose-p:text-gray-500
                        prose-li:text-gray-500 prose-li:leading-relaxed
                        prose-strong:text-gray-900 prose-strong:font-semibold
                        prose-hr:my-6 prose-hr:border-gray-200
                        prose-ul:my-3 prose-ol:my-3"
                      dangerouslySetInnerHTML={{ __html: contentHtml }}
                    />
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  Nenhum conteudo adicionado.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revisions tab */}
        <TabsContent value="revisoes" className="mt-3">
          <PolicyRevisionsList revisions={revisions} />
        </TabsContent>

        {/* Config / Details tab */}
        <TabsContent value="config" className="mt-3">
          <PolicyMetadataGrid
            policy={policy}
            statusDef={statusDef}
            catDef={catDef}
            isOverdue={!!isOverdue}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
