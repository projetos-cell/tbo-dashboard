"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { BriefingForm } from "./briefing-form";

export default function BriefingPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = params.slug;

  const clientName = decodeURIComponent(
    searchParams.get("nome") || slug,
  ).replace(/-/g, " ");
  const projectSlug = searchParams.get("projeto") || "";
  const projectName = decodeURIComponent(
    searchParams.get("projeto_nome") || "",
  ).replace(/-/g, " ");

  const [existingData, setExistingData] = useState<
    Record<string, unknown> | undefined
  >();
  const [briefingId, setBriefingId] = useState<string | undefined>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Tentar carregar rascunho existente via API
    fetch(`/api/briefing/draft?slug=${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.form_data) {
          setExistingData(data.form_data);
          setBriefingId(data.id);
        }
      })
      .catch(() => {
        // Sem rascunho, segue sem dados existentes
      })
      .finally(() => setReady(true));
  }, [slug]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-[#E85102]" />
      </div>
    );
  }

  return (
    <BriefingForm
      slug={slug}
      clientName={clientName}
      projectSlug={projectSlug}
      projectName={projectName}
      existingData={existingData}
      briefingId={briefingId}
    />
  );
}
