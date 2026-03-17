import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@/lib/supabase/server";

/**
 * Folder structure mirroring "00.PASTA BASE" in Google Drive.
 * Each entry is a path relative to the project root folder.
 */
const FOLDER_STRUCTURE = [
  "00.ARQUIVOS RECEBIDOS",
  "01.MARKETING",
  "01.MARKETING/DIAGNÓSTICO",
  "02.BRANDING",
  "02.BRANDING/LOGOTIPO",
  "02.BRANDING/MANUAL DE MARCA",
  "03.INTERIORES",
  "04.DIGITAL 3D",
  "04.DIGITAL 3D/00.RECEBIDOS",
  "04.DIGITAL 3D/01.BASES MAX",
  "04.DIGITAL 3D/02.IMAGENS",
  "04.DIGITAL 3D/02.IMAGENS/R00",
  "04.DIGITAL 3D/02.IMAGENS/R01",
  "04.DIGITAL 3D/02.IMAGENS/R02",
  "04.DIGITAL 3D/03.FORMALIZAÇÃO",
  "05.PROD.AUDIOVISUAL",
  "05.PROD.AUDIOVISUAL/01.BRIEFINGS",
  "05.PROD.AUDIOVISUAL/02.ORÇAMENTOS",
  "06.REFERÊNCIAS",
  "06.REFERÊNCIAS/01.ARQUITETÔNICO",
  "06.REFERÊNCIAS/02.INTERIORES",
  "06.REFERÊNCIAS/03.PROD. AUDIOVISUAIS",
  "07.ATAS DE REUNIÃO",
  "08.FORMALIZAÇÃO DE ENTREGA",
  "08.FORMALIZAÇÃO DE ENTREGA/01.MARKETING",
  "08.FORMALIZAÇÃO DE ENTREGA/02.BRANDING",
  "08.FORMALIZAÇÃO DE ENTREGA/03.INTERIORES",
  "08.FORMALIZAÇÃO DE ENTREGA/04.DIGITAL 3D",
  "08.FORMALIZAÇÃO DE ENTREGA/05.PRODUÇÃO AUDIOVISUAL",
  "10.PERSPECTIVAS",
  "10.PERSPECTIVAS/01.EP01",
  "10.PERSPECTIVAS/01.EP01/01.SKETCH",
  "10.PERSPECTIVAS/01.EP01/02.LUMION",
  "10.PERSPECTIVAS/01.EP01/03.MOVAVI",
  "10.PERSPECTIVAS/01.EP01/04.IMAGEM",
  "10.PERSPECTIVAS/01.EP01/05.VIDEO",
  "10.PERSPECTIVAS/01.EP01/06.APRESENTAÇÃO",
];

function getDriveClient() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentials) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not configured");
  }

  const parsed = JSON.parse(credentials);
  const auth = new google.auth.GoogleAuth({
    credentials: parsed,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
}

async function createFolder(
  drive: ReturnType<typeof google.drive>,
  name: string,
  parentId: string,
): Promise<string> {
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
  });

  return res.data.id!;
}

export async function POST(request: NextRequest) {
  try {
    const { projectId, projectName } = await request.json();

    if (!projectId || !projectName) {
      return NextResponse.json(
        { error: "projectId and projectName are required" },
        { status: 400 },
      );
    }

    // Verify auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parentFolderId = process.env.GOOGLE_DRIVE_PROJECTS_FOLDER_ID;
    if (!parentFolderId) {
      return NextResponse.json(
        { error: "GOOGLE_DRIVE_PROJECTS_FOLDER_ID not configured" },
        { status: 500 },
      );
    }

    const drive = getDriveClient();

    // Create root project folder
    const rootFolderId = await createFolder(drive, projectName, parentFolderId);

    // Create all subfolders, tracking parent IDs by path
    const folderIds: Record<string, string> = { "": rootFolderId };

    for (const path of FOLDER_STRUCTURE) {
      const parts = path.split("/");
      const folderName = parts[parts.length - 1];
      const parentPath = parts.slice(0, -1).join("/");
      const parentId = folderIds[parentPath] ?? rootFolderId;

      const folderId = await createFolder(drive, folderName, parentId);
      folderIds[path] = folderId;
    }

    // Update project with Google folder ID
    const { error: updateError } = await supabase
      .from("projects")
      .update({ google_folder_id: rootFolderId } as never)
      .eq("id", projectId);

    if (updateError) {
      console.error("[google/drive] Failed to update project:", updateError);
    }

    return NextResponse.json({
      folderId: rootFolderId,
      folderUrl: `https://drive.google.com/drive/folders/${rootFolderId}`,
      foldersCreated: Object.keys(folderIds).length,
    });
  } catch (err) {
    console.error("[google/drive] Error creating folder structure:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
