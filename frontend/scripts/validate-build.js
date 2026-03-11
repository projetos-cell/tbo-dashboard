/**
 * CI Check: Validate Next.js frontend structure is intact.
 */
import { existsSync } from "fs";

const REQUIRED = [
  "frontend/package.json",
  "frontend/next.config.ts",
  "frontend/app/layout.tsx",
  "frontend/app/(auth)/layout.tsx",
  "frontend/lib/supabase/client.ts",
  "frontend/middleware.ts",
];

let missing = 0;
for (const f of REQUIRED) {
  if (!existsSync(f)) { console.error(`::error::Required file missing: ${f}`); missing++; }
  else console.log(`${f}: OK`);
}

if (missing > 0) { console.error(`\n${missing} required file(s) missing.`); process.exit(1); }
else console.log("\nAll required files present.");
