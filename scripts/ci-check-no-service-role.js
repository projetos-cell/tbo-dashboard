#!/usr/bin/env node
/**
 * CI Guardrail: Verifica que NÃO existe service_role key em código frontend.
 *
 * Escaneia todos os arquivos JS/HTML na raiz e pastas src/, utils/, modules/, js/
 * (excluindo supabase/functions/, archive/, node_modules/).
 *
 * Retorna exit code 1 se encontrar violação.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ROOT = process.cwd();
const SCAN_DIRS = ['src', 'utils', 'modules', 'js', 'api', 'pages'];
const SKIP_DIRS = ['node_modules', 'supabase', 'archive', 'database', 'docs', '.git'];
const SCAN_EXTS = ['.js', '.html', '.htm', '.ts'];

// Padrões que indicam service_role no frontend
const PATTERNS = [
  /service_role/gi,
  /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6[A-Za-z0-9+/=]+\.eyJyb2xlIjoic2VydmljZV9yb2xlIn0/g,
];

let violations = 0;

function scanFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  for (const pattern of PATTERNS) {
    pattern.lastIndex = 0;
    const match = pattern.exec(content);
    if (match) {
      const relPath = filePath.replace(ROOT + '/', '').replace(ROOT + '\\', '');
      console.error(`  FAIL: ${relPath} — contém "${match[0].substring(0, 40)}..."`);
      violations++;
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

console.log('=== CI: Verificando ausência de service_role no frontend ===\n');

// Escanear root files
for (const entry of readdirSync(ROOT)) {
  if (SKIP_DIRS.includes(entry)) continue;
  const fullPath = join(ROOT, entry);
  const stat = statSync(fullPath);
  if (!stat.isDirectory() && SCAN_EXTS.includes(extname(entry).toLowerCase())) {
    scanFile(fullPath);
  }
}

// Escanear subdirs
for (const dir of SCAN_DIRS) {
  scanDir(join(ROOT, dir));
}

console.log('');
if (violations > 0) {
  console.error(`FALHOU: ${violations} violação(ões) de service_role encontrada(s).`);
  process.exit(1);
} else {
  console.log('PASSOU: Nenhuma service_role key no código frontend.');
  process.exit(0);
}
