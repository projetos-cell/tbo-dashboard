/**
 * Upload contract files from Google Drive to Supabase Storage
 *
 * Reads contracts from the DB, finds local files, renames professionally,
 * uploads to Supabase Storage, and updates file_url + file_name in DB.
 *
 * Usage: node scripts/upload-contracts.mjs
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// ─── Config ──────────────────────────────────────────────────────────
const SUPABASE_URL = "https://olnndpultyllyhzxuyxh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sbm5kcHVsdHlsbHloenh1eXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyOTUxNjMsImV4cCI6MjA4Njg3MTE2M30.PPhMqKsYKcRB6GFmWxogcc0HIggkojK0DumiB1NDAXU";

const BUCKET = "contracts";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Helpers ─────────────────────────────────────────────────────────

/** Slugify a string for safe filenames */
function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "-")    // non-alphanumeric → dash
    .replace(/^-+|-+$/g, "")        // trim dashes
    .substring(0, 80);              // limit length
}

/** Get MIME type from file extension */
function getMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return map[ext] ?? "application/octet-stream";
}

/** Generate professional storage path */
function buildStoragePath(contract) {
  const category = slugify(contract.category ?? "geral");
  const person = slugify(contract.person_name ?? "sem-responsavel");
  const shortId = contract.id.substring(0, 8);
  const titleSlug = slugify(contract.title);
  const ext = path.extname(contract.source_path || contract.file_name || ".pdf").toLowerCase();

  // Pattern: {category}/{person}/{shortId}_{title}.{ext}
  // e.g.: cliente/arthaus/6ef855ec_tbo-x-arthaus-penha-branding.pdf
  return `${category}/${person}/${shortId}_${titleSlug}${ext}`;
}

/** Generate professional display name */
function buildDisplayName(contract) {
  const ext = path.extname(contract.source_path || contract.file_name || ".pdf").toLowerCase();
  // "TBO x ARTHAUS - Branding.pdf"
  const title = contract.title
    .replace(/^Contrato prestação de serviços\s*-?\s*/i, "")
    .replace(/^Aditivo de Contrato\s*-?\s*/i, "Aditivo - ")
    .trim();
  return `${title}${ext}`;
}

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log("🔄 Fetching contracts from database...");

  const { data: contracts, error } = await supabase
    .from("contracts")
    .select("id, title, category, person_name, file_url, file_name, source_path, monthly_value")
    .order("category")
    .order("title");

  if (error) {
    console.error("❌ Error fetching contracts:", error.message);
    process.exit(1);
  }

  console.log(`📋 Found ${contracts.length} contracts\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  let notFound = 0;

  for (const contract of contracts) {
    const sourcePath = contract.source_path;

    // Check if file_url is already a Supabase URL (already uploaded)
    if (contract.file_url?.startsWith("http")) {
      skipped++;
      continue;
    }

    // Resolve local file path
    if (!sourcePath) {
      console.log(`⏭️  [${contract.title}] No source_path, skipping`);
      skipped++;
      continue;
    }

    // Normalize path for Windows
    const localPath = sourcePath.replace(/\//g, "\\");

    if (!fs.existsSync(localPath)) {
      console.log(`⚠️  [${contract.title}] File not found: ${localPath}`);
      notFound++;
      continue;
    }

    // Build professional storage path + display name
    const storagePath = buildStoragePath(contract);
    const displayName = buildDisplayName(contract);
    const mime = getMime(localPath);

    try {
      // Read file
      const fileBuffer = fs.readFileSync(localPath);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType: mime,
          upsert: true,
        });

      if (uploadError) {
        console.log(`❌ [${contract.title}] Upload error: ${uploadError.message}`);
        failed++;
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath);

      const publicUrl = urlData.publicUrl;

      // Update database record
      const { error: updateError } = await supabase
        .from("contracts")
        .update({
          file_url: publicUrl,
          file_name: displayName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contract.id);

      if (updateError) {
        console.log(`❌ [${contract.title}] DB update error: ${updateError.message}`);
        failed++;
        continue;
      }

      uploaded++;
      const sizeKb = (fileBuffer.length / 1024).toFixed(0);
      console.log(`✅ [${uploaded}] ${displayName} (${sizeKb}KB) → ${storagePath}`);

    } catch (err) {
      console.log(`❌ [${contract.title}] Error: ${err.message}`);
      failed++;
    }
  }

  console.log("\n" + "═".repeat(60));
  console.log(`📊 Results:`);
  console.log(`   ✅ Uploaded:  ${uploaded}`);
  console.log(`   ⏭️  Skipped:   ${skipped}`);
  console.log(`   ⚠️  Not found: ${notFound}`);
  console.log(`   ❌ Failed:    ${failed}`);
  console.log("═".repeat(60));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
