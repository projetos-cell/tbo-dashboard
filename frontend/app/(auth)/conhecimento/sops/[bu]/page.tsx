"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SOPList } from "@/features/conhecimento/components/sop-list";
import { SOPCreateDialog } from "@/features/conhecimento/components/sop-create-dialog";
import type { SOPBu } from "@/features/conhecimento/types/sops";

const VALID_BUS: SOPBu[] = [
  "digital-3d", "branding", "marketing", "audiovisual",
  "gamificacao", "operacoes", "atendimento", "comercial",
  "financeiro", "recursos-humanos", "relacionamentos", "politicas",
];

export default function SOPBuPage() {
  const params = useParams();
  const router = useRouter();
  const bu = params.bu as string;
  const [createOpen, setCreateOpen] = useState(false);

  if (!VALID_BUS.includes(bu as SOPBu)) {
    router.replace("/conhecimento/sops");
    return null;
  }

  return (
    <>
      <SOPList bu={bu as SOPBu} onCreateNew={() => setCreateOpen(true)} />
      <SOPCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultBu={bu as SOPBu}
      />
    </>
  );
}
