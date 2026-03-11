/**
 * CI Check: Ensure Supabase client is created through shared utility only.
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const FRONTEND_DIR = "frontend";
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);
const ALLOWED = new Set([
  "frontend/lib/supabase/client.ts",
  "frontend/lib/supabase/server.ts",
  "frontend/lib/supabase/middleware.ts",
  "frontend/lib/supabase/admin.ts",
]);
const PATTERNS = [/createClient\s*\(/, /createBrowserClient\s*\(/, /createServerClient\s*\(/];

function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === "node_modules" || entry === ".next") continue;
    const stat = statSync(full);
    if (stat.isDirectory()) results.push(...walk(full));
    else if (EXTENSIONS.has(extname(full))) results.push(full);
  }
  return results;
}

let violations = 0;
for (const file of walk(FRONTEND_DIR)) {
  if (ALLOWED.has(file.replace(/\/g, "/"))) continue;
  const lines = readFileSync(file, "utf-8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith("import")) continue;
    for (const p of PATTERNS) {
      if (p.test(lines[i])) {
        console.error(`::error file=${file},line=${i + 1}::Direct Supabase client creation outside shared utility`);
        violations++;
      }
    }
  }
}

if (violations > 0) { console.error(`\n${violations} violation(s).`); process.exit(1); }
else console.log("Supabase client creation is centralized.");
