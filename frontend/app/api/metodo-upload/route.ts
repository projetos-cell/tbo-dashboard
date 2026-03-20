import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "public-assets";
const FOLDER = "metodo";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const bu = formData.get("bu") as string | null;
  const step = formData.get("step") as string | null;

  if (!file || !bu || !step) {
    return NextResponse.json({ error: "Missing file, bu, or step" }, { status: 400 });
  }

  const safeBu = bu.replace(/[^a-z0-9-]/gi, "").toLowerCase();
  const safeStep = step.replace(/[^a-z0-9-]/gi, "").toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const allowedExts = ["jpg", "jpeg", "png", "webp", "gif", "avif"];
  if (!allowedExts.includes(ext)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const filename = `${safeBu}_${safeStep}.${ext}`;
  const storagePath = `${FOLDER}/${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  // Remove old file for this step (any extension)
  const { data: existing } = await supabase.storage
    .from(BUCKET)
    .list(FOLDER, { search: `${safeBu}_${safeStep}` });

  if (existing && existing.length > 0) {
    const toRemove = existing
      .filter((f) => f.name.startsWith(`${safeBu}_${safeStep}`))
      .map((f) => `${FOLDER}/${f.name}`);
    if (toRemove.length > 0) {
      await supabase.storage.from(BUCKET).remove(toRemove);
    }
  }

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  return NextResponse.json({
    url: urlData.publicUrl,
    filename,
  });
}

export async function GET(req: NextRequest) {
  const bu = req.nextUrl.searchParams.get("bu");
  if (!bu) {
    return NextResponse.json({ error: "Missing bu param" }, { status: 400 });
  }

  const safeBu = bu.replace(/[^a-z0-9-]/gi, "").toLowerCase();
  const supabase = await createClient();

  const { data: files } = await supabase.storage
    .from(BUCKET)
    .list(FOLDER, { search: safeBu });

  if (!files || files.length === 0) {
    return NextResponse.json({});
  }

  const matching = files
    .filter((f) => f.name.startsWith(`${safeBu}_`))
    .reduce<Record<string, string>>((acc, f) => {
      const match = f.name.match(new RegExp(`^${safeBu}_(.+)\\.[a-z]+$`));
      if (match) {
        const { data } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(`${FOLDER}/${f.name}`);
        acc[match[1]] = data.publicUrl;
      }
      return acc;
    }, {});

  return NextResponse.json(matching);
}

export async function DELETE(req: NextRequest) {
  const bu = req.nextUrl.searchParams.get("bu");
  const step = req.nextUrl.searchParams.get("step");

  if (!bu || !step) {
    return NextResponse.json({ error: "Missing bu or step param" }, { status: 400 });
  }

  const safeBu = bu.replace(/[^a-z0-9-]/gi, "").toLowerCase();
  const safeStep = step.replace(/[^a-z0-9-]/gi, "").toLowerCase();
  const supabase = await createClient();

  const { data: files } = await supabase.storage
    .from(BUCKET)
    .list(FOLDER, { search: `${safeBu}_${safeStep}` });

  if (!files || files.length === 0) {
    return NextResponse.json({ deleted: 0 });
  }

  const toRemove = files
    .filter((f) => f.name.startsWith(`${safeBu}_${safeStep}`))
    .map((f) => `${FOLDER}/${f.name}`);

  if (toRemove.length > 0) {
    await supabase.storage.from(BUCKET).remove(toRemove);
  }

  return NextResponse.json({ deleted: toRemove.length });
}
