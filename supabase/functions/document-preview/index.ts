// ============================================================================
// TBO OS — Edge Function: Document Preview Generator
// Gera thumbnail/preview de documentos (PDFs, imagens) no Storage
// Chamado apos upload de nova versao de documento
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req: Request) => {
  try {
    const { document_version_id, file_path, mime_type } = await req.json();

    if (!document_version_id || !file_path) {
      return new Response(JSON.stringify({ error: "document_version_id e file_path sao obrigatorios" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Determinar tipo de preview baseado no mime_type
    const isImage = mime_type?.startsWith("image/");
    const isPdf = mime_type === "application/pdf";

    let thumbnailPath = null;

    if (isImage) {
      // Para imagens, usar Supabase Storage transform (resize)
      // O transform e feito via URL, nao precisa gerar arquivo separado
      const { data: publicUrl } = supabase.storage
        .from("document-versions")
        .getPublicUrl(file_path, {
          transform: {
            width: 400,
            height: 300,
            resize: "contain"
          }
        });

      thumbnailPath = publicUrl?.publicUrl || null;

    } else if (isPdf) {
      // Para PDFs, gerar preview da primeira pagina
      // Nota: Supabase Storage nao tem transform nativo para PDF
      // Salvamos o path do PDF e o frontend usa pdf.js para preview inline
      thumbnailPath = `preview:pdf:${file_path}`;

    } else {
      // Para outros tipos, usar icone generico baseado no tipo
      const iconMap: Record<string, string> = {
        "application/msword": "file-text",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "file-text",
        "application/vnd.ms-excel": "file-spreadsheet",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "file-spreadsheet",
        "application/vnd.ms-powerpoint": "file-presentation",
        "application/zip": "file-archive",
        "application/x-rar-compressed": "file-archive",
        "video/mp4": "video",
        "video/quicktime": "video",
        "audio/mpeg": "music",
      };
      const icon = iconMap[mime_type || ""] || "file";
      thumbnailPath = `preview:icon:${icon}`;
    }

    // Atualizar thumbnail_path no document_versions
    if (thumbnailPath) {
      const { error } = await supabase
        .from("document_versions")
        .update({ thumbnail_path: thumbnailPath })
        .eq("id", document_version_id);

      if (error) {
        console.error("Error updating thumbnail:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      document_version_id,
      thumbnail_path: thumbnailPath,
      preview_type: isImage ? "image" : isPdf ? "pdf" : "icon"
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  }
});
