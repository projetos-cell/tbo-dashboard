#!/usr/bin/env node
// ============================================================================
// TBO OS — Build Validation Script (Next.js)
// Verifica integridade da estrutura do projeto antes do deploy
// Executa: node scripts/validate-build.js
// ============================================================================

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let errors = 0;
let warnings = 0;

function error(msg) { console.error(`  ERROR: ${msg}`); errors++; }
function warn(msg)  { console.warn(`  WARN:  ${msg}`); warnings++; }
function ok(msg)    { console.log(`  OK:    ${msg}`); }

console.log('\n=== TBO OS Build Validator (Next.js) ===\n');

// 1. Verificar estrutura Next.js obrigatória
const REQUIRED_FILES = [
  'frontend/package.json',
  'frontend/next.config.ts',
  'frontend/app/layout.tsx',
  'frontend/app/(auth)/layout.tsx',
  'frontend/lib/supabase/client.ts',
  'frontend/lib/supabase/middleware.ts',
];

for (const file of REQUIRED_FILES) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) {
    error(`Arquivo obrigatorio ausente: ${file}`);
  } else {
    ok(`${file} presente`);
  }
}

// 2. Verificar vercel.json
const vercelPath = path.join(ROOT, 'vercel.json');
if (!fs.existsSync(vercelPath)) {
  warn('vercel.json ausente');
} else {
  try {
    JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
    ok('vercel.json valido');
  } catch (e) {
    error(`vercel.json invalido: ${e.message}`);
  }
}

// 3. Verificar package.json do frontend
const pkgPath = path.join(ROOT, 'frontend', 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (pkg.dependencies?.next) {
    ok(`Next.js ${pkg.dependencies.next}`);
  } else {
    error('Next.js nao encontrado em dependencies');
  }
  if (pkg.dependencies?.['@supabase/ssr']) {
    ok('@supabase/ssr presente');
  } else {
    warn('@supabase/ssr nao encontrado em dependencies');
  }
}

// 4. Verificar migrations SQL
for (const dir of ['database', 'supabase/migrations']) {
  const dirPath = path.join(ROOT, dir);
  if (fs.existsSync(dirPath)) {
    const sqlFiles = fs.readdirSync(dirPath).filter(f => f.endsWith('.sql'));
    if (sqlFiles.length > 0) ok(`${sqlFiles.length} migrations em ${dir}/`);
  }
}

// Resultado final
console.log('\n' + '='.repeat(40));
if (errors > 0) {
  console.log(`FALHOU: ${errors} erros, ${warnings} avisos`);
  process.exit(1);
} else {
  console.log(`PASSOU: 0 erros, ${warnings} avisos`);
  process.exit(0);
}
