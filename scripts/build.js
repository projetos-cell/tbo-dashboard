/**
 * TBO OS — Build Script
 * Concatena e minifica todos os JS/CSS locais em um unico bundle.
 * Nao usa import/export — apenas concatenacao + minificacao via esbuild.
 *
 * Uso: node scripts/build.js
 */

const fs = require('fs');
const path = require('path');
const { transformSync } = require('esbuild');

// ─── Configuracao ────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const INDEX_HTML = path.join(ROOT, 'index.html');

// ─── Helpers ─────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function isExternalUrl(src) {
  return /^https?:\/\//i.test(src);
}

function isCdnCss(href) {
  return /^https?:\/\//i.test(href);
}

// ─── 1) Ler index.html ──────────────────────────────────────────
console.log('\n=== TBO OS Build ===\n');

if (!fs.existsSync(INDEX_HTML)) {
  console.error('ERRO: index.html nao encontrado em', INDEX_HTML);
  process.exit(1);
}

const htmlSource = fs.readFileSync(INDEX_HTML, 'utf-8');

// ─── 2) Extrair tags <script src="..."> ─────────────────────────
// Captura todas as tags <script src="..."> (com ou sem atributos extras)
const scriptTagRegex = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi;
const cdnScripts = [];       // tags CDN preservadas como estao
const localScriptPaths = []; // caminhos locais na ordem original
const allScriptTags = [];    // todas as tags para substituicao

let match;
while ((match = scriptTagRegex.exec(htmlSource)) !== null) {
  const fullTag = match[0];
  const src = match[1];
  allScriptTags.push({ fullTag, src });

  if (isExternalUrl(src)) {
    cdnScripts.push(fullTag);
  } else {
    localScriptPaths.push(src);
  }
}

console.log(`Scripts encontrados: ${allScriptTags.length} total`);
console.log(`  CDN (preservados):  ${cdnScripts.length}`);
console.log(`  Locais (bundled):   ${localScriptPaths.length}`);

// ─── 3) Extrair tags <link rel="stylesheet" href="..."> ────────
const cssLinkRegex = /<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["'][^>]*\/?>/gi;
const cdnCssLinks = [];
const localCssPaths = [];
const allCssTags = [];

while ((match = cssLinkRegex.exec(htmlSource)) !== null) {
  const fullTag = match[0];
  const href = match[1];
  allCssTags.push({ fullTag, href });

  if (isCdnCss(href)) {
    cdnCssLinks.push(fullTag);
  } else {
    localCssPaths.push(href);
  }
}

console.log(`\nCSS encontrados: ${allCssTags.length} total`);
console.log(`  CDN (preservados):  ${cdnCssLinks.length}`);
console.log(`  Locais (bundled):   ${localCssPaths.length}`);

// ─── 4) Concatenar JS ───────────────────────────────────────────
console.log('\n--- Concatenando JS ---');
let concatenatedJs = '';
let totalOriginalJsSize = 0;
const missingFiles = [];

for (const src of localScriptPaths) {
  const filePath = path.join(ROOT, src);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(src);
    console.warn(`  AVISO: arquivo nao encontrado — ${src}`);
    continue;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  totalOriginalJsSize += Buffer.byteLength(content, 'utf-8');
  // Separador com nome do arquivo (ajuda no debug se desminificar)
  concatenatedJs += `\n/* ====== ${src} ====== */\n`;
  concatenatedJs += content;
  concatenatedJs += '\n';
}

if (missingFiles.length > 0) {
  console.warn(`\n  ${missingFiles.length} arquivo(s) nao encontrado(s) — serao ignorados.\n`);
}

// ─── 5) Minificar JS ────────────────────────────────────────────
console.log('Minificando JS com esbuild...');
const jsResult = transformSync(concatenatedJs, {
  minify: true,
  // Nao usar bundle — eh so transformacao
  loader: 'js',
  target: 'es2020',
  // Manter nomes de funcoes/classes para nao quebrar singletons globais
  keepNames: true,
});
const minifiedJs = jsResult.code;

// ─── 6) Concatenar e minificar CSS ──────────────────────────────
console.log('Concatenando e minificando CSS...');
let concatenatedCss = '';
let totalOriginalCssSize = 0;

for (const href of localCssPaths) {
  const filePath = path.join(ROOT, href);
  if (!fs.existsSync(filePath)) {
    console.warn(`  AVISO: CSS nao encontrado — ${href}`);
    continue;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  totalOriginalCssSize += Buffer.byteLength(content, 'utf-8');
  concatenatedCss += `\n/* ====== ${href} ====== */\n`;
  concatenatedCss += content;
  concatenatedCss += '\n';
}

let minifiedCss = '';
if (concatenatedCss.length > 0) {
  const cssResult = transformSync(concatenatedCss, {
    minify: true,
    loader: 'css',
  });
  minifiedCss = cssResult.code;
}

// ─── 7) Gerar dist/index.html ───────────────────────────────────
console.log('Gerando dist/index.html...');

let outputHtml = htmlSource;

// Remover TODAS as tags <script src="..."> locais (nao-CDN)
for (const { fullTag, src } of allScriptTags) {
  if (!isExternalUrl(src)) {
    outputHtml = outputHtml.replace(fullTag, '');
  }
}

// Remover TODAS as tags <link stylesheet> locais (nao-CDN)
for (const { fullTag, href } of allCssTags) {
  if (!isCdnCss(href)) {
    outputHtml = outputHtml.replace(fullTag, '');
  }
}

// Inserir referencia ao CSS minificado — logo apos o ultimo CSS CDN ou antes do </head>
if (minifiedCss.length > 0) {
  const cssTag = '  <link rel="stylesheet" href="tbo-os.min.css">';
  // Tentar inserir apos o ultimo link CDN de CSS
  const lastCdnCss = cdnCssLinks[cdnCssLinks.length - 1];
  if (lastCdnCss && outputHtml.includes(lastCdnCss)) {
    outputHtml = outputHtml.replace(lastCdnCss, lastCdnCss + '\n' + cssTag);
  } else {
    outputHtml = outputHtml.replace('</head>', cssTag + '\n</head>');
  }
}

// Inserir referencia ao JS minificado — antes do </body>
const jsTag = '  <script src="tbo-os.min.js"></script>';
outputHtml = outputHtml.replace('</body>', jsTag + '\n</body>');

// Limpar linhas com apenas espacos e comentarios HTML que ficaram orfaos
// (comentarios que precediam tags de script/css removidas)
outputHtml = outputHtml.replace(/^[ \t]*<!--[^>]*-->[ \t]*\n(?=[ \t]*\n)/gm, '');
// Limpar linhas vazias multiplas criadas pela remocao das tags
outputHtml = outputHtml.replace(/\n{3,}/g, '\n\n');

// ─── 8) Escrever dist/ ──────────────────────────────────────────
if (!fs.existsSync(DIST)) {
  fs.mkdirSync(DIST, { recursive: true });
}

fs.writeFileSync(path.join(DIST, 'tbo-os.min.js'), minifiedJs, 'utf-8');
if (minifiedCss.length > 0) {
  fs.writeFileSync(path.join(DIST, 'tbo-os.min.css'), minifiedCss, 'utf-8');
}
fs.writeFileSync(path.join(DIST, 'index.html'), outputHtml, 'utf-8');

// ─── 9) Estatisticas ────────────────────────────────────────────
const minifiedJsSize = Buffer.byteLength(minifiedJs, 'utf-8');
const minifiedCssSize = Buffer.byteLength(minifiedCss, 'utf-8');
const totalOriginal = totalOriginalJsSize + totalOriginalCssSize;
const totalMinified = minifiedJsSize + minifiedCssSize;

console.log('\n=== Resultado do Build ===\n');
console.log('JavaScript:');
console.log(`  Original:   ${formatBytes(totalOriginalJsSize)} (${localScriptPaths.length} arquivos)`);
console.log(`  Minificado: ${formatBytes(minifiedJsSize)} (1 arquivo)`);
if (totalOriginalJsSize > 0) {
  const jsRatio = ((1 - minifiedJsSize / totalOriginalJsSize) * 100).toFixed(1);
  console.log(`  Reducao:    ${jsRatio}%`);
}

console.log('\nCSS:');
console.log(`  Original:   ${formatBytes(totalOriginalCssSize)} (${localCssPaths.length} arquivos)`);
console.log(`  Minificado: ${formatBytes(minifiedCssSize)} (1 arquivo)`);
if (totalOriginalCssSize > 0) {
  const cssRatio = ((1 - minifiedCssSize / totalOriginalCssSize) * 100).toFixed(1);
  console.log(`  Reducao:    ${cssRatio}%`);
}

console.log('\nTotal:');
console.log(`  Original:   ${formatBytes(totalOriginal)}`);
console.log(`  Minificado: ${formatBytes(totalMinified)}`);
if (totalOriginal > 0) {
  const totalRatio = ((1 - totalMinified / totalOriginal) * 100).toFixed(1);
  console.log(`  Reducao:    ${totalRatio}%`);
}

console.log(`\nArquivos gerados em: ${DIST}/`);
console.log('  - index.html');
console.log('  - tbo-os.min.js');
if (minifiedCss.length > 0) console.log('  - tbo-os.min.css');
console.log('\nBuild concluido com sucesso!\n');
