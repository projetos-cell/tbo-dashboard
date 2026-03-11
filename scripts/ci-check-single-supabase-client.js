#!/usr/bin/env node
/**
 * CI Guardrail: Verifica que createClient() só é chamado nos locais permitidos.
 *
 * Locais permitidos (Next.js):
 *   - frontend/lib/supabase/client.ts
 *   - frontend/lib/supabase/server.ts
 *   - frontend/lib/supabase/middleware.ts
 *   - frontend/lib/supabase/admin.ts
 *
 * Locais permitidos (Legacy — mantidos durante migração):
 *   - src/infra/supabase/client.js
 *   - utils/supabase.js
 *   - js/supabase-client.js
 *
 * Qualquer outro createClient() é violação.
 * Retorna exit code 1 se encontrar violação.
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SKIP_DIRS = ['node_modules', '.next', 'supabase', 'archive', 'database', 'docs', 'dist', '.git'];
const SCAN_EXTS = ['.js', '.ts', '.tsx'];

// Arquivos onde createClient() é PERMITIDO
const ALLOWED_FILES = [
  'frontend/lib/supabase/client.ts',
  'frontend/lib/supabase/server.ts',
  'frontend/lib/supabase/middleware.ts',
  'frontend/lib/supabase/admin.ts',
  // Legacy (mantidos durante migração)
  'src/infra/supabase/client.js',
  'utils/supabase.js',
  'js/supabase-client.js'
];

function normalize(p) {
  return p.replace(/\\/g, '/');
}

const PATTERN = /supabase\.createClient\s*\(/g;

let violations = 0;

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  PATTERN.lastIndex = 0;
  if (PATTERN.test(content)) {
    const relPath = normalize(filePath.replace(ROOT + '/', '').replace(ROOT + '\\', ''));
    if (!ALLOWED_FILES.includes(relPath)) {
      console.error(`  FAIL: ${relPath} — chama createClient() mas NÃO está na lista permitida`);
      violations++;
    } else {
      console.log(`  OK:   ${relPath} (permitido)`);
    }
  }
}

function scanDir(dirPath) {
  let entries;
  try {
    entries = fs.readdirSync(dirPath);
  } catch {
    return;
  }

  for (const entry of entries) {
    if (SKIP_DIRS.includes(entry)) continue;
    const fullPath = path.join(dirPath, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (SCAN_EXTS.includes(path.extname(entry).toLowerCase())) {
      scanFile(fullPath);
    }
  }
}

console.log('=== CI: Verificando single Supabase client ===\n');

// Escanear tudo
scanDir(ROOT);

console.log('');
if (violations > 0) {
  console.error(`FALHOU: ${violations} createClient() não autorizado(s) encontrado(s).`);
  console.error('Mova a lógica para usar o client centralizado.');
  process.exit(1);
} else {
  console.log('PASSOU: createClient() apenas nos locais autorizados.');
  process.exit(0);
}
