"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconTrash,
  IconClock,
  IconTag,
  IconAlertCircle,
  IconCircleCheck,
  IconHistory,
  IconPlus,
  IconAlertTriangle,
  IconBulb,
  IconNote,
  IconChecklist,
  IconListCheck,
  IconChevronDown,
  IconChevronRight,
  IconUser,
  IconCalendar,
  IconPencil,
  IconEye,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ErrorState, EmptyState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useSopBySlug, useSopSteps, useDeleteSop, useUpdateSop } from "../hooks/use-sops";
import {
  SOP_STATUS_CONFIG,
  SOP_PRIORITY_CONFIG,
  SOP_CATEGORY_CONFIG,
  SOP_BU_CONFIG,
  type SOPBu,
  type SOPStep,
} from "../types/sops";
import { RACIMatrix, isRACIStep } from "./raci-matrix";
import { MarkdownText } from "./markdown-text";
import {
  ToolsRenderer,
  SLARenderer,
  FlowchartRenderer,
  GlossaryRenderer,
  ChecklistRenderer,
  detectSpecialSection,
} from "./sop-section-renderers";
import { SOPStepEditor } from "./sop-step-editor";
import { SOPTemplateDownload, StepTemplateDownloadButton } from "./sop-template-download";
import { TemplateCardsRenderer } from "./sop-template-cards";

interface SOPDetailViewProps {
  bu: SOPBu;
  slug: string;
}

// Ícones por tipo de step
const STEP_ICON: Record<string, React.ElementType> = {
  step: IconListCheck,
  warning: IconAlertTriangle,
  tip: IconBulb,
  note: IconNote,
  checkpoint: IconChecklist,
};

const STEP_STYLE: Record<string, { accent: string; bg: string; text: string }> = {
  step: { accent: "border-l-blue-400", bg: "bg-background", text: "text-blue-600" },
  warning: { accent: "border-l-amber-400", bg: "bg-amber-50/50 dark:bg-amber-950/10", text: "text-amber-600" },
  tip: { accent: "border-l-emerald-400", bg: "bg-emerald-50/50 dark:bg-emerald-950/10", text: "text-emerald-600" },
  note: { accent: "border-l-gray-400", bg: "bg-muted/30", text: "text-muted-foreground" },
  checkpoint: { accent: "border-l-green-500", bg: "bg-green-50/50 dark:bg-green-950/10", text: "text-green-600" },
};

// Categorizar steps em seções lógicas
function categorizeSteps(steps: SOPStep[]) {
  const sections: { title: string; id: string; steps: SOPStep[] }[] = [];

  // Agrupar steps por seção principal (1., 2., 3., etc.)
  // Steps com título "N.X ..." são sub-items da seção N
  type Section = { title: string; id: string; steps: SOPStep[] };
  let current: Section | null = null;
  let currentNum = "";

  const IMPLICIT_NAMES: Record<string, string> = {
    "2": "Escopo",
    "4": "Pré-requisitos",
    "5": "Procedimento Passo a Passo",
    "6": "Critérios de Qualidade",
  };

  for (const step of steps) {
    const match = step.title.match(/^(\d+)\./);
    if (!match) {
      if (current) current.steps.push(step);
      continue;
    }

    const mainNum = match[1];
    const isSubSection = /^\d+\.\s*\d+/.test(step.title);

    if (isSubSection && current && currentNum === mainNum) {
      // Sub-seção da mesma seção
      current.steps.push(step);
    } else if (isSubSection && currentNum !== mainNum) {
      // Sub-seção de nova seção sem header pai (ex: 5.1 sem "5.")
      if (current && current.steps.length > 0) sections.push(current);
      const title = IMPLICIT_NAMES[mainNum] || `Seção ${mainNum}`;
      current = { title, id: `section-${mainNum}`, steps: [step] };
      currentNum = mainNum;
    } else {
      // Nova seção principal
      if (current && current.steps.length > 0) sections.push(current);
      const cleanTitle = step.title.replace(/^\d+\.\s*/, "");
      current = { title: cleanTitle, id: `section-${mainNum}`, steps: [step] };
      currentNum = mainNum;
    }
  }

  if (current && current.steps.length > 0) {
    sections.push(current);
  }

  return sections;
}

// Extrair objetivo do primeiro step
function extractObjective(steps: SOPStep[]): string | null {
  const objetivoStep = steps.find((s) =>
    s.title.toLowerCase().includes("objetivo")
  );
  return objetivoStep?.content ?? null;
}

export function SOPDetailView({ bu, slug }: SOPDetailViewProps) {
  const router = useRouter();
  const { data: sop, isLoading, error, refetch } = useSopBySlug(slug);
  const { data: steps, isLoading: stepsLoading } = useSopSteps(sop?.id ?? "");
  const deleteSop = useDeleteSop();
  const updateSop = useUpdateSop();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["section-5"]));
  const [isEditing, setIsEditing] = useState(false);

  const buConfig = SOP_BU_CONFIG[bu];

  const sections = useMemo(() => categorizeSteps(steps ?? []), [steps]);
  const objective = useMemo(() => extractObjective(steps ?? []), [steps]);

  // Seções de contexto (1-4) vs procedimento (5+)
  const contextSections = sections.filter((s) => {
    const num = parseInt(s.id.replace("section-", ""));
    return num >= 1 && num <= 4;
  });
  const procedureSections = sections.filter((s) => {
    const num = parseInt(s.id.replace("section-", ""));
    return num === 5;
  });
  const supportSections = sections.filter((s) => {
    const num = parseInt(s.id.replace("section-", ""));
    return num >= 6;
  });

  function toggleSection(id: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-[300px] rounded-lg" />
        </div>
      </div>
    );
  }

  if (!sop) {
    return (
      <EmptyState
        icon={IconAlertCircle}
        title="SOP não encontrado"
        description="Este procedimento não existe ou foi removido."
      />
    );
  }

  const statusCfg = SOP_STATUS_CONFIG[sop.status];
  const categoryCfg = SOP_CATEGORY_CONFIG[sop.category];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href={`/conhecimento/sops/${bu}`}
          className="hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <IconArrowLeft className="size-4" />
          SOPs — {buConfig.label}
        </Link>
      </div>

      {/* Header compacto */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ backgroundColor: buConfig.color }}
            />
            <span className="text-xs font-mono text-muted-foreground uppercase">
              {sop.slug.split("-").slice(0, 3).join("-")}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{sop.title}</h1>
          {objective && (
            <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
              {objective}
            </p>
          )}
        </div>

        <RequireRole minRole="lider">
          <div className="flex items-center gap-2 shrink-0">
            <SOPTemplateDownload
              steps={steps ?? []}
              sopTitle={sop.title}
              sopSlug={sop.slug}
              sopBu={buConfig.label}
              sopVersion={sop.version}
            />
            <Button
              size="sm"
              variant={isEditing ? "default" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <IconEye className="size-4 mr-1" />
                  Visualizar
                </>
              ) : (
                <>
                  <IconPencil className="size-4 mr-1" />
                  Editar
                </>
              )}
            </Button>
            {sop.status === "draft" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateSop.mutate({ id: sop.id, updates: { status: "published" } })}
                disabled={updateSop.isPending}
              >
                <IconCircleCheck className="size-4 mr-1" />
                Publicar
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="ghost" className="text-destructive">
                  <IconTrash className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir SOP?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O SOP &quot;{sop.title}&quot; será permanentemente removido.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      deleteSop.mutate(sop.id);
                      router.push(`/conhecimento/sops/${bu}`);
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </RequireRole>
      </div>

      {/* Metadata bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="gap-1">
          <span className="size-1.5 rounded-full bg-green-500" />
          {statusCfg.label}
        </Badge>
        <Badge variant="outline">{categoryCfg.label}</Badge>
        <Badge variant="outline">v{sop.version}</Badge>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <IconCalendar className="size-3" />
          {new Date(sop.updated_at).toLocaleDateString("pt-BR")}
        </span>
        {sop.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-[10px]">
            {tag}
          </Badge>
        ))}
      </div>

      <Separator />

      {/* Layout principal: conteúdo + sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        {/* Coluna principal */}
        <div className="space-y-4 min-w-0">
          {stepsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : sections.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                <p className="text-sm">Nenhuma seção documentada ainda.</p>
              </CardContent>
            </Card>
          ) : isEditing ? (
            /* ─── Modo Edição: todos os steps editáveis ─── */
            <div className="space-y-2">
              {(steps ?? []).map((step) => (
                <SOPStepEditor key={step.id} step={step} sopId={sop.id} />
              ))}
            </div>
          ) : (
            <>
              {/* Contexto (Objetivo, Escopo, RACI, Pré-requisitos) — colapsável */}
              {contextSections.length > 0 && (
                <div className="space-y-2">
                  {contextSections.map((section) => (
                    <SectionAccordion
                      key={section.id}
                      section={section}
                      isOpen={expandedSections.has(section.id)}
                      onToggle={() => toggleSection(section.id)}
                      defaultCollapsed
                      sopSlug={sop.slug}
                      sopTitle={sop.title}
                      sopBu={buConfig.label}
                      sopVersion={sop.version}
                    />
                  ))}
                </div>
              )}

              {/* Procedimento (seção 5) — sempre aberto e com destaque */}
              {procedureSections.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-base font-semibold flex items-center gap-2 pt-2">
                    <IconListCheck className="size-4 text-tbo-orange" />
                    Procedimento Passo a Passo
                  </h2>
                  {procedureSections.map((section) => (
                    <div key={section.id} className="space-y-2">
                      {section.steps.slice(1).map((step, idx) => {
                        const style = STEP_STYLE[step.step_type] ?? STEP_STYLE.step;
                        const StepIcon = STEP_ICON[step.step_type] ?? IconListCheck;
                        const cleanTitle = step.title.replace(/^\d+\.\d*\.?\s*/, "");
                        const isChecklist = step.step_type === "checkpoint" && step.content?.includes("[ ]");

                        return (
                          <div
                            key={step.id}
                            className={`border-l-[3px] ${style.accent} ${style.bg} rounded-r-lg p-4`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`shrink-0 mt-0.5 ${style.text}`}>
                                <StepIcon className="size-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm">{cleanTitle}</h4>
                                {step.content && (
                                  isChecklist ? (
                                    <div className="mt-2">
                                      <ChecklistRenderer content={step.content} />
                                    </div>
                                  ) : (
                                    <MarkdownText className="text-sm text-muted-foreground mt-1.5 whitespace-pre-wrap leading-relaxed">
                                      {step.content}
                                    </MarkdownText>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}

              {/* Seções de suporte (6+): Qualidade, Ferramentas, SLAs, etc. */}
              {supportSections.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <IconNote className="size-4 text-muted-foreground" />
                    Referência
                  </h2>
                  {supportSections.map((section) => (
                    <SectionAccordion
                      key={section.id}
                      section={section}
                      isOpen={expandedSections.has(section.id)}
                      onToggle={() => toggleSection(section.id)}
                      defaultCollapsed
                      sopSlug={sop.slug}
                      sopTitle={sop.title}
                      sopBu={buConfig.label}
                      sopVersion={sop.version}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar — índice + metadata */}
        <aside className="hidden lg:block space-y-4">
          {/* Índice */}
          {sections.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Índice
                </h3>
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const num = section.id.replace("section-", "");
                    const isProcedure = num === "5";
                    return (
                      <button
                        key={section.id}
                        onClick={() => {
                          setExpandedSections((prev) => new Set([...prev, section.id]));
                          document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className={`block w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted transition-colors truncate ${
                          isProcedure ? "font-medium text-tbo-orange" : "text-muted-foreground"
                        }`}
                      >
                        <span className="font-mono mr-1.5">{num}.</span>
                        {section.title}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          )}

          {/* Metadata card */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Informações
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">BU</span>
                  <span className="font-medium">{buConfig.label}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Versão</span>
                  <span className="font-medium">v{sop.version}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criado</span>
                  <span>{new Date(sop.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Atualizado</span>
                  <span>{new Date(sop.updated_at).toLocaleDateString("pt-BR")}</span>
                </div>
                {sop.last_reviewed_at && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revisado</span>
                      <span>{new Date(sop.last_reviewed_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seções</span>
                  <span>{sections.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-[10px] h-5">
                    {statusCfg.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

// ─── Section Accordion ───────────────────────────────────────────

function SectionAccordion({
  section,
  isOpen,
  onToggle,
  defaultCollapsed,
  sopSlug,
  sopTitle,
  sopBu,
  sopVersion,
}: {
  section: { title: string; id: string; steps: SOPStep[] };
  isOpen: boolean;
  onToggle: () => void;
  defaultCollapsed?: boolean;
  sopSlug?: string;
  sopTitle?: string;
  sopBu?: string;
  sopVersion?: number;
}) {
  const firstStep = section.steps[0];
  const subSteps = section.steps.slice(1);
  const hasContent = firstStep?.content && firstStep.content.length > 0;
  const isRACI = isRACIStep(section.title);
  const specialType = detectSpecialSection(section.title);

  function renderSpecialContent(content: string) {
    if (isRACI) return <RACIMatrix content={content} />;
    switch (specialType) {
      case "template": return (
        <TemplateCardsRenderer
          content={content}
          sopTitle={sopTitle ?? ""}
          sopSlug={sopSlug ?? ""}
          sopBu={sopBu ?? ""}
          sopVersion={sopVersion ?? 1}
        />
      );
      case "tools": return <ToolsRenderer content={content} />;
      case "sla": return <SLARenderer content={content} />;
      case "flowchart": return <FlowchartRenderer content={content} />;
      case "glossary": return <GlossaryRenderer content={content} />;
      case "checklist": return <ChecklistRenderer content={content} />;
      default: return null;
    }
  }

  const hasSpecialRenderer = isRACI || specialType !== null;

  return (
    <div id={section.id}>
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 w-full text-left py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group">
            {isOpen ? (
              <IconChevronDown className="size-4 text-muted-foreground shrink-0" />
            ) : (
              <IconChevronRight className="size-4 text-muted-foreground shrink-0" />
            )}
            <span className="font-medium text-sm">{section.title}</span>
            {sopSlug && firstStep && (
              <StepTemplateDownloadButton
                step={firstStep}
                sopSlug={sopSlug}
                sopTitle={sopTitle ?? ""}
                sopBu={sopBu ?? ""}
                sopVersion={sopVersion ?? 1}
              />
            )}
            {!isOpen && subSteps.length > 0 && !hasSpecialRenderer && (
              <span className="text-[10px] text-muted-foreground ml-auto">
                {subSteps.length + 1} itens
              </span>
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="pl-9 pb-2 space-y-2">
            {hasSpecialRenderer && hasContent ? (
              renderSpecialContent(firstStep.content!)
            ) : (
              <>
                {hasContent && (
                  <MarkdownText className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {firstStep.content!}
                  </MarkdownText>
                )}
                {subSteps.map((step) => {
                  const style = STEP_STYLE[step.step_type] ?? STEP_STYLE.step;
                  const StepIcon = STEP_ICON[step.step_type] ?? IconListCheck;
                  const cleanTitle = step.title.replace(/^\d+\.\s*\d+\s*/, "");

                  return (
                    <div
                      key={step.id}
                      className={`border-l-2 ${style.accent} ${style.bg} rounded-r-md px-3 py-2`}
                    >
                      <div className="flex items-start gap-2">
                        <StepIcon className={`size-3.5 shrink-0 mt-0.5 ${style.text}`} />
                        <div className="min-w-0">
                          <span className="text-xs font-medium">{cleanTitle}</span>
                          {step.content && (
                            <MarkdownText className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap leading-relaxed">
                              {step.content}
                            </MarkdownText>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
