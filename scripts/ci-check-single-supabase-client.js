#!/usr/bin/env node
/**
 * CI Guardrail: Verifica que createClient() só é chamado nos locais permitidos.
 *
 * Locais permitidos:
 *   - src/infra/supabase/client.js (TBO_DB — single client)
 *   - utils/supabase.js (TBO_SUPABASE — legacy, delega para TBO_DB)
 *   - js/supabase-client.js (TBO_ONBOARDING_DB — onboarding standalone)
 *   - supabase/functions/** (Edge Functions — server-side)
 *
 * Qualquer outro createClient() é violação.
 * Retorna exit code 1 se encontrar violação.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ROOT = process.cwd();
const SKIP_DIRS = ['node_modules', 'supabase', 'archive', 'database', 'docs', 'dist', '.git'];
const SCAN_EXTS = ['.js', '.html', '.htm', '.ts'];

// Arquivos onde createClient() é PERMITIDO
const ALLOWED_FILES = [
  'src/infra/supabase/client.js',
  'utils/supabase.js',
  'js/supabase-client.js'
].map(f => f.replace(/\//g, '\\').replace(/\\/g, '/'));

function normalize(p) {
  return p.replace(/\\/g, '/');
}

const PATTERN = /supabase\.createClient\s*\(/g;

let violations = 0;

function scanFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
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
    entries = readdirSync(dirPath);
  } catch {
    return;
  }

  for (const entry of entries) {
    if (SKIP_DIRS.includes(entry)) continue;
    const fullPath = join(dirPath, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (SCAN_EXTS.includes(extname(entry).toLowerCase())) {
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
  console.error('Mova a lógica para usar TBO_DB.from() ou RepoBase.getDb().');
  process.exit(1);
} else {
  console.log('PASSOU: createClient() apenas nos locais autorizados.');
  process.exit(0);
}
