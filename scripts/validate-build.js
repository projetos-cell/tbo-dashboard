#!/usr/bin/env node
// ============================================================================
// TBO OS — Build Validation Script
// Verifica integridade do build antes do deploy
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

console.log('\n=== TBO OS Build Validator ===\n');

// 1. Verificar que index.html existe
const indexPath = path.join(ROOT, 'index.html');
if (!fs.existsSync(indexPath)) {
  error('index.html nao encontrado');
} else {
  ok('index.html presente');

  // 2. Verificar que todos os scripts referenciados existem
  const html = fs.readFileSync(indexPath, 'utf8');
  const scriptRefs = html.match(/src="([^"]+\.js)"/g) || [];
  let missingScripts = 0;
  scriptRefs.forEach(ref => {
    const src = ref.replace('src="', '').replace('"', '');
    if (src.startsWith('http')) return; // CDN — ignorar
    const fullPath = path.join(ROOT, src);
    if (!fs.existsSync(fullPath)) {
      error(`Script referenciado mas ausente: ${src}`);
      missingScripts++;
    }
  });
  if (missingScripts === 0) ok(`${scriptRefs.length} scripts referenciados, todos presentes`);
}

// 3. Verificar config.js NAO esta no build
if (fs.existsSync(path.join(ROOT, 'config.js'))) {
  warn('config.js presente no build — verificar .gitignore');
}
if (fs.existsSync(path.join(ROOT, 'config.example.js'))) {
  ok('config.example.js presente');
}

// 4. Verificar vercel.json
const vercelPath = path.join(ROOT, 'vercel.json');
if (!fs.existsSync(vercelPath)) {
  error('vercel.json ausente');
} else {
  try {
    JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
    ok('vercel.json valido');
  } catch (e) {
    error(`vercel.json invalido: ${e.message}`);
  }
}

// 5. Calcular tamanho total de JS
let totalJS = 0;
let jsFileCount = 0;
const jsExts = ['.js'];
function countJS(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach(e => {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== 'node_modules' && e.name !== '.git') {
      countJS(full);
    } else if (e.isFile() && jsExts.includes(path.extname(e.name))) {
      totalJS += fs.statSync(full).size;
      jsFileCount++;
    }
  });
}
countJS(ROOT);
const totalMB = (totalJS / 1024 / 1024).toFixed(2);
if (totalJS > 3 * 1024 * 1024) {
  warn(`Total JS: ${totalMB}MB (${jsFileCount} arquivos) — considere minificacao`);
} else {
  ok(`Total JS: ${totalMB}MB (${jsFileCount} arquivos)`);
}

// 6. Verificar credenciais hardcoded
const dangerPatterns = [
  /api[_-]?key\s*[:=]\s*['"][a-f0-9-]{20,}['"]/gi,
  /api[_-]?secret\s*[:=]\s*['"][a-f0-9]{20,}['"]/gi,
  /supabase_anon_key\s*[:=]\s*['"]eyJ/gi
];
const filesToCheck = ['app.js'];
['modules', 'utils', 'js'].forEach(dir => {
  const dirPath = path.join(ROOT, dir);
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(f => {
      if (f.endsWith('.js')) filesToCheck.push(path.join(dir, f));
    });
  }
});
let credFound = 0;
filesToCheck.forEach(relPath => {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) return;
  const content = fs.readFileSync(fullPath, 'utf8');
  dangerPatterns.forEach(pat => {
    const matches = content.match(pat);
    if (matches) {
      error(`Credencial hardcoded em ${relPath}: ${matches[0].substring(0, 40)}...`);
      credFound++;
    }
  });
});
if (credFound === 0) ok('Nenhuma credencial hardcoded detectada');

// 7. Verificar migrations SQL
const dbDir = path.join(ROOT, 'database');
if (fs.existsSync(dbDir)) {
  const sqlFiles = fs.readdirSync(dbDir).filter(f => f.endsWith('.sql'));
  ok(`${sqlFiles.length} migrations SQL encontradas`);
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
