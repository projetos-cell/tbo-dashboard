const fs = require('fs');
const path = require('path');

const BASE = 'H:/Meu Drive/03.AGÊNCIA_TBO/ADMINISTRAÇÃO/JURÍDICO/CONTRATOS';
const TENANT_ID = '89080d1a-bc79-4c3f-8fce-20aabc561c0d';

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      if (file === 'desktop.ini' || file.endsWith('.tmp')) continue;
      const full = path.join(dir, file);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        results = results.concat(walk(full));
      } else {
        results.push(full.replace(/\\/g, '/'));
      }
    }
  } catch (e) {
    console.error('Error walking', dir, e.message);
  }
  return results;
}

function escSql(s) {
  if (!s) return '';
  return s.replace(/'/g, "''");
}

function parseFilePath(filePath) {
  // Normalize path separators
  const normalized = filePath.replace(/\\/g, '/');
  const baseNorm = BASE.replace(/\\/g, '/');
  const rel = normalized.replace(baseNorm + '/', '');
  const parts = rel.split('/');

  const categoryFolder = parts[0];
  let category, type, status, personName, projectName;

  if (categoryFolder === 'CLIENTES') {
    category = 'cliente';
    type = 'pj';
    status = 'active';
    personName = parts[1] || '';
    if (parts.length > 3) {
      projectName = parts.slice(2, -1).join(' / ');
    }
  } else if (categoryFolder === 'EQUIPE') {
    category = 'equipe';
    type = 'freelancer';
    if (parts[1] === '.OUT') {
      status = 'expired';
      personName = parts[2] || '';
      if (parts.length > 4) {
        projectName = parts.slice(3, -1).join(' / ');
      }
    } else {
      status = 'active';
      personName = parts[1] || '';
      if (parts.length > 3) {
        projectName = parts.slice(2, -1).join(' / ');
      }
    }
  } else if (categoryFolder === 'FORNECEDORES') {
    category = 'fornecedor';
    type = 'pj';
    status = 'active';
    personName = parts[1] || '';
    if (parts.length > 3) {
      projectName = parts.slice(2, -1).join(' / ');
    }
  } else if (categoryFolder === 'DISTRATOS') {
    category = 'distrato';
    type = 'outro';
    status = 'cancelled';
    personName = parts[1] || '';
  } else {
    category = 'cliente';
    type = 'outro';
    status = 'active';
    personName = parts[0] || '';
  }

  const fileName = parts[parts.length - 1];
  const ext = path.extname(fileName).toLowerCase();

  // Clean up title from filename
  let title = fileName
    .replace(/\.[^.]+$/, '') // remove extension
    .replace(/^R0\d_/, '')
    .replace(/^1_/, '')
    .replace(/^2º\s*/, '')
    .replace(/^3º\s*/, '')
    .replace(/^Contrato\s+prestação\s+de\s+serviços\s*-?\s*/i, '')
    .replace(/^Contrato\s+de\s+Prestação\s+de\s+Serviços\s*-?\s*/i, '')
    .replace(/^Service\s+Agreement\s*[–\-]\s*/i, '')
    .replace(/^DISTRATO\s*/i, 'Distrato ')
    .replace(/^Carta\s+de\s+Orçamento_/i, 'Orcamento ')
    .replace(/^Carta\s+Rescisão\s+Contratual\s*/i, 'Rescisao ')
    .replace(/^Cronograma_/i, 'Cronograma ')
    .replace(/^Declaração\s+de\s+Renda\s*-?\s*/i, 'Declaracao de Renda - ')
    .replace(/^Boleto\s+Sinal\s*-?\s*/i, 'Boleto Sinal - ')
    .replace(/^ContratoAssinado/i, 'Contrato Assinado')
    .trim();

  if (!title || title.length < 3) {
    title = fileName.replace(/\.[^.]+$/, '');
  }

  const storagePath = [category, personName, projectName, fileName]
    .filter(Boolean)
    .join('/');

  return {
    category,
    type,
    status,
    personName,
    projectName: projectName || null,
    title,
    fileName,
    ext,
    storagePath,
    sourcePath: normalized,
  };
}

// Scan all files
const files = walk(BASE);
console.error(`Scanned ${files.length} files`);

// Group by unique contract (deduplicate doc/pdf pairs)
const contractGroups = new Map();

for (const f of files) {
  const r = parseFilePath(f);
  const titleBase = r.title
    .replace(/\s*\(\d+\)\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  const key = `${r.category}|${r.personName}|${r.projectName || ''}|${titleBase}`;

  if (!contractGroups.has(key)) {
    contractGroups.set(key, {
      ...r,
      files: [{ name: r.fileName, ext: r.ext, path: r.storagePath }],
    });
  } else {
    contractGroups
      .get(key)
      .files.push({ name: r.fileName, ext: r.ext, path: r.storagePath });
  }
}

console.error(`Grouped into ${contractGroups.size} unique contracts`);

// Generate SQL
const inserts = [];
for (const [, group] of contractGroups) {
  // Prefer PDF over DOC
  const pdfFile = group.files.find((f) => f.ext === '.pdf');
  const bestFile = pdfFile || group.files[0];

  const projVal = group.projectName
    ? `'${escSql(group.projectName)}'`
    : 'NULL';

  const row = [
    `'${TENANT_ID}'`,
    `'${escSql(group.personName)}'`,
    `'${escSql(group.type)}'`,
    `'${escSql(group.title)}'`,
    `'${escSql(group.category)}'`,
    projVal,
    `'${escSql(group.status)}'`,
    `'${escSql(bestFile.name)}'`,
    `'${escSql(bestFile.path)}'`,
    `'${escSql(group.sourcePath)}'`,
  ].join(', ');

  inserts.push(`(${row})`);
}

// Output in batches
const BATCH = 25;
for (let i = 0; i < inserts.length; i += BATCH) {
  const batch = inserts.slice(i, i + BATCH);
  const batchNum = Math.floor(i / BATCH) + 1;
  console.log(`-- Batch ${batchNum}`);
  console.log(
    'INSERT INTO contracts (tenant_id, person_name, type, title, category, project_name, status, file_name, file_url, source_path) VALUES'
  );
  console.log(batch.join(',\n') + ';');
  console.log('');
}

console.log(`-- Total unique contracts: ${contractGroups.size}`);
console.log(`-- Total files scanned: ${files.length}`);
