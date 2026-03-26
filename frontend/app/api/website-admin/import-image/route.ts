import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/website-admin/import-image
 * Downloads an image from an external URL and uploads it to Supabase Storage.
 * Body: { url: string, tenantId: string, folder?: string }
 * Returns: { publicUrl: string }
 */
export async function POST(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    const body = await req.json();
    const { url, tenantId, folder = "website" } = body as {
      url: string;
      tenantId: string;
      folder?: string;
    };

    if (!url || !tenantId) {
      return NextResponse.json(
        { error: "url and tenantId are required" },
        { status: 400 },
      );
    }

    // Fetch the external image
    const imageRes = await fetch(url);
    if (!imageRes.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${imageRes.status}` },
        { status: 502 },
      );
    }

    const contentType = imageRes.headers.get("content-type") ?? "image/webp";
    const buffer = await imageRes.arrayBuffer();

    // Determine extension from content-type or URL
    const extMap: Record<string, string> = {
      "image/webp": "webp",
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
    };
    const ext = extMap[contentType] ?? url.split(".").pop()?.split("?")[0] ?? "webp";

    const path = `${tenantId}/${folder}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("marketing-assets")
      .upload(path, buffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 },
      );
    }

    const { data } = supabaseAdmin.storage
      .from("marketing-assets")
      .getPublicUrl(path);

    return NextResponse.json({ publicUrl: data.publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
