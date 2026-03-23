"use client";

import { useParams, useRouter } from "next/navigation";
import { SOPDetailView } from "@/features/conhecimento/components/sop-detail-view";
import type { SOPBu } from "@/features/conhecimento/types/sops";

const VALID_BUS: SOPBu[] = [
  "digital-3d", "branding", "marketing", "audiovisual",
  "gamificacao", "operacoes", "atendimento", "comercial",
  "financeiro", "recursos-humanos", "relacionamentos", "politicas",
];

export default function SOPDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bu = params.bu as string;
  const slug = params.slug as string;

  if (!VALID_BUS.includes(bu as SOPBu)) {
    router.replace("/conhecimento/sops");
    return null;
  }

  return <SOPDetailView bu={bu as SOPBu} slug={slug} />;
}
