import { readFileSync, writeFileSync } from 'fs';

for (let i = 0; i < 7; i++) {
  const sql = readFileSync(`scripts/exec_batch_${i}.sql`, 'utf8');
  const encoded = encodeURIComponent(sql);
  const js = `window.__batchSQL = decodeURIComponent("${encoded}");\n"Batch ${i} loaded: " + window.__batchSQL.length + " chars"`;
  writeFileSync(`scripts/inject_batch_${i}.js`, js);
  console.log(`inject_batch_${i}.js: ${js.length} chars`);
}
