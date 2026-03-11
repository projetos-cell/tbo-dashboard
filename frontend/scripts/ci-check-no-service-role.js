/**
 * CI Check: Ensure no service_role key is used in frontend code.
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const FRONTEND_DIR = "frontend";
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);
const PATTERNS = [/service_role/i, /SUPABASE_SERVICE_ROLE/i, /supabaseServiceRole/i];

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
  const lines = readFileSync(file, "utf-8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    for (const pattern of PATTERNS) {
      if (pattern.test(lines[i])) {
        console.error(`::error file=${file},line=${i + 1}::service_role key found in frontend code`);
        violations++;
      }
    }
  }
}

if (violations > 0) { console.error(`\n${violations} service_role violation(s).`); process.exit(1); }
else console.log("No service_role keys in frontend code.");
