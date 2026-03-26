"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { IconCloudUpload, IconEye, IconColumns } from "@tabler/icons-react";
import { ReviewViewer } from "@/features/review/components/review-viewer";
import { ReviewViewerSidebar } from "@/features/review/components/review-viewer-sidebar";
import { VersionTimeline } from "@/features/review/components/version-timeline";
import { VersionUploadDialog } from "@/features/review/components/version-upload-dialog";
import { ComparisonSlider } from "@/features/review/components/comparison-slider";
import { ApprovalPanel } from "@/features/review/components/approval-panel";
import { useReviewScene } from "@/features/review/hooks/use-review-scenes";
import { useReviewVersions } from "@/features/review/hooks/use-review-versions";
import { useReviewAnnotations, useCreateAnnotation, useCreateReply, useToggleResolved, useDeleteAnnotation } from "@/features/review/hooks/use-review-annotations";
import { useAuthStore } from "@/stores/auth-store";

interface SceneViewerPageProps {
  params: Promise<{ projectId: string; sceneId: string }>;
}

function SceneViewerSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between gap-4 mb-4">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-8 w-28" />
      </div>
      <Skeleton className="h-16 w-full rounded-lg mb-4" />
      <div className="flex flex-1 gap-0 rounded-xl overflow-hidden border">
        <Skeleton className="flex-1" />
        <Skeleton className="w-80" />
      </div>
    </div>
  );
}

type ViewMode = "visualizar" | "comparar";

export default function SceneViewerPage({ params }: SceneViewerPageProps) {
  const { projectId, sceneId } = use(params);
  const userId = useAuthStore((s) => s.user?.id);

  const { data: scene, isLoading: loadingScene } = useReviewScene(sceneId);
  const { data: versions = [], isLoading: loadingVersions } = useReviewVersions(sceneId);

  const latestVersionId = versions.length > 0 ? versions[versions.length - 1].id : null;
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("visualizar");
  const [uploadOpen, setUploadOpen] = useState(false);

  const activeVersionId = selectedVersionId ?? latestVersionId;
  const activeVersion = versions.find((v) => v.id === activeVersionId) ?? null;
  const compareVersion = versions.find((v) => v.id === compareVersionId) ?? null;

  const { data: annotations = [] } = useReviewAnnotations(activeVersionId ?? undefined);
  const createAnnotation = useCreateAnnotation(activeVersionId ?? "");
  const createReply = useCreateReply(activeVersionId ?? "");
  const toggleResolved = useToggleResolved(activeVersionId ?? "");
  const deleteAnnotation = useDeleteAnnotation(activeVersionId ?? "");

  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [newPin, setNewPin] = useState<{ x: number; y: number } | null>(null);
  const [newComment, setNewComment] = useState("");
  const [showResolved, setShowResolved] = useState(false);

  const handleImageClick = useCallback((x: number, y: number) => {
    setNewPin({ x, y });
    setSelectedPinId(null);
    setNewComment("");
  }, []);

  const handleCreateAnnotation = useCallback(() => {
    if (!newPin || !newComment.trim()) return;
    createAnnotation.mutate(
      { content: newComment.trim(), x_pct: newPin.x, y_pct: newPin.y },
      {
        onSuccess: () => {
          setNewPin(null);
          setNewComment("");
        },
      }
    );
  }, [newPin, newComment, createAnnotation]);

  const handleCancelNewPin = useCallback(() => {
    setNewPin(null);
    setNewComment("");
  }, []);

  // When switching to compare mode, default compare version to second-to-last
  const handleViewModeChange = (mode: ViewMode) => {
    if (mode === "comparar" && !compareVersionId && versions.length >= 2) {
      const secondLatest = versions[versions.length - 2];
      if (secondLatest) setCompareVersionId(secondLatest.id);
    }
    setViewMode(mode);
  };

  const nextVersionNumber = versions.length;

  if (loadingScene || loadingVersions) return <SceneViewerSkeleton />;
  if (!scene) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/review">Creative Review</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/review/${projectId}`}>{projectId}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{scene.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          {versions.length >= 2 && (
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(v) => v && handleViewModeChange(v as ViewMode)}
              size="sm"
            >
              <ToggleGroupItem value="visualizar" aria-label="Visualizar">
                <IconEye className="h-4 w-4 mr-1" />
                Visualizar
              </ToggleGroupItem>
              <ToggleGroupItem value="comparar" aria-label="Comparar">
                <IconColumns className="h-4 w-4 mr-1" />
                Comparar
              </ToggleGroupItem>
            </ToggleGroup>
          )}

          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <IconCloudUpload className="mr-1.5 h-4 w-4" />
            Nova Versão
          </Button>
        </div>
      </div>

      {/* Version Timeline */}
      {versions.length > 0 && (
        <div className="rounded-lg border bg-card px-4 py-2 mb-4">
          <VersionTimeline
            versions={versions}
            selectedVersionId={activeVersionId}
            onSelectVersion={setSelectedVersionId}
          />
        </div>
      )}

      {/* Compare version selector */}
      {viewMode === "comparar" && versions.length >= 2 && (
        <div className="flex items-center gap-3 mb-3 rounded-lg border bg-card px-4 py-2">
          <span className="text-sm text-muted-foreground shrink-0">Comparar com:</span>
          <Select
            value={compareVersionId ?? ""}
            onValueChange={setCompareVersionId}
          >
            <SelectTrigger className="h-8 w-40 text-sm">
              <SelectValue placeholder="Selecionar versão" />
            </SelectTrigger>
            <SelectContent>
              {versions
                .filter((v) => v.id !== activeVersionId)
                .map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.version_label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Main content */}
      {activeVersion ? (
        viewMode === "comparar" && compareVersion ? (
          /* Comparison mode */
          <div className="flex flex-1 min-h-0 flex-col gap-3">
            <ComparisonSlider
              leftImageUrl={activeVersion.file_url}
              rightImageUrl={compareVersion.file_url}
              leftLabel={activeVersion.version_label}
              rightLabel={compareVersion.version_label}
              className="flex-1 min-h-0"
            />
          </div>
        ) : (
          /* Viewer mode */
          <div className="flex flex-1 min-h-0 rounded-xl border overflow-hidden">
            <ReviewViewer
              imageUrl={activeVersion.file_url}
              imageName={`${scene.name} — ${activeVersion.version_label}`}
              annotations={annotations}
              selectedPinId={selectedPinId}
              newPin={newPin}
              showResolved={showResolved}
              onPinSelect={setSelectedPinId}
              onImageClick={handleImageClick}
            />
            <ReviewViewerSidebar
              annotations={annotations}
              selectedPinId={selectedPinId}
              newPin={newPin}
              newComment={newComment}
              showResolved={showResolved}
              isCreating={createAnnotation.isPending}
              currentUserId={userId}
              onNewCommentChange={setNewComment}
              onCreateAnnotation={handleCreateAnnotation}
              onCancelNewPin={handleCancelNewPin}
              onSelectPin={setSelectedPinId}
              onReply={(parentId, content) =>
                createReply.mutate({ parent_id: parentId, content })
              }
              onToggleResolved={(id, resolved) =>
                toggleResolved.mutate({ id, resolved })
              }
              onDelete={(id) => deleteAnnotation.mutate(id)}
              onShowResolvedChange={setShowResolved}
            />
          </div>
        )
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-xl border bg-muted/30">
          <div className="text-center space-y-3">
            <p className="text-muted-foreground">Nenhuma versão disponível para esta cena.</p>
            <Button onClick={() => setUploadOpen(true)}>
              <IconCloudUpload className="mr-1.5 h-4 w-4" />
              Enviar Primeira Versão
            </Button>
          </div>
        </div>
      )}

      {/* Approval Panel */}
      {activeVersionId && (
        <div className="mt-3">
          <ApprovalPanel versionId={activeVersionId} />
        </div>
      )}

      {/* Upload Dialog */}
      <VersionUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        sceneId={sceneId}
        projectId={projectId}
        nextVersionNumber={nextVersionNumber}
      />
    </div>
  );
}
