import { notFound } from "next/navigation";
import Image from "next/image";
import { createServiceClient } from "@/lib/supabase/service";
import { validateShareToken } from "@/features/review/services/review-share";
import { getReviewProject } from "@/features/review/services/review-projects";
import { getScenesByProject } from "@/features/review/services/review-scenes";
import { getVersionsByScene } from "@/features/review/services/review-versions";
import { ShareViewerClient } from "@/features/review/components/share-viewer-client";
import type { ReviewScene, ReviewVersion } from "@/features/review/types";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function ReviewSharePage({ params }: SharePageProps) {
  const { token } = await params;
  const supabase = createServiceClient();

  // Validate token
  const shareLink = await validateShareToken(supabase, token);
  if (!shareLink) notFound();

  // Fetch project + scenes
  const project = await getReviewProject(supabase, shareLink.project_id);
  if (!project) notFound();

  const scenes = await getScenesByProject(supabase, shareLink.project_id);

  // Fetch all versions for all scenes
  const versionsMap: Record<string, ReviewVersion[]> = {};
  await Promise.all(
    scenes.map(async (scene: ReviewScene) => {
      const versions = await getVersionsByScene(supabase, scene.id);
      versionsMap[scene.id] = versions;
    })
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header */}
      <header className="border-b px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded bg-foreground/10 flex items-center justify-center">
            <span className="text-xs font-bold">TBO</span>
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">{project.name}</p>
            {project.client_name && (
              <p className="text-xs text-muted-foreground mt-0.5">{project.client_name}</p>
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Review Criativo
        </div>
      </header>

      {scenes.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Nenhuma cena disponível neste projeto.
          </p>
        </div>
      ) : (
        <ShareViewerClient
          scenes={scenes}
          versionsMap={versionsMap}
          permissions={shareLink.permissions}
          token={token}
        />
      )}
    </div>
  );
}

export async function generateMetadata({ params }: SharePageProps) {
  const { token } = await params;
  try {
    const supabase = createServiceClient();
    const shareLink = await validateShareToken(supabase, token);
    if (!shareLink) return { title: "Link inválido" };
    const project = await getReviewProject(supabase, shareLink.project_id);
    return {
      title: project ? `${project.name} — Creative Review` : "Creative Review",
    };
  } catch {
    return { title: "Creative Review" };
  }
}
