/**
 * exec_demands_api.mjs
 *
 * Executes demands SQL batches via the Supabase dashboard API.
 * Reads the API config (token + connEncrypted) from the downloaded JSON file,
 * then executes each mini-batch SQL file sequentially.
 *
 * Usage: node scripts/exec_demands_api.mjs
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Load API config
const config = JSON.parse(readFileSync('C:/Users/marco/Downloads/sb_api_config.json', 'utf8'));

const API_URL = config.url;
const TOKEN = config.token;
const CONN_ENCRYPTED = config.connEncrypted;

async function execSQL(sql, label) {
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'authorization': 'Bearer ' + TOKEN,
      'content-type': 'application/json',
      'x-connection-encrypted': CONN_ENCRYPTED,
      'x-pg-application-name': 'supabase/dashboard-query-editor'
    },
    body: JSON.stringify({ query: sql, disable_statement_timeout: true })
  });

  const data = await resp.json();

  if (resp.status !== 201) {
    console.error(`[FAIL] ${label}: HTTP ${resp.status} - ${JSON.stringify(data).substring(0, 200)}`);
    return false;
  }

  console.log(`[OK] ${label}: HTTP ${resp.status}`);
  return true;
}

async function main() {
  const batchDir = 'C:/Users/marco/Desktop/tbo-dashboard-main/tbo-dashboard-main/scripts/mini_batches_v2';

  // Step 1: Execute DELETE
  console.log('=== Step 1: Delete existing demands ===');
  const deleteSql = readFileSync(join(batchDir, 'batch_delete.sql'), 'utf8');
  const deleteOk = await execSQL(deleteSql, 'DELETE');
  if (!deleteOk) {
    console.error('DELETE failed. Aborting.');
    process.exit(1);
  }

  // Step 2: Execute all INSERT batches
  console.log('\n=== Step 2: Insert demands in mini-batches ===');
  const files = readdirSync(batchDir)
    .filter(f => f.startsWith('batch_') && f !== 'batch_delete.sql' && f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} batch files`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < files.length; i++) {
    const sql = readFileSync(join(batchDir, files[i]), 'utf8');
    const ok = await execSQL(sql, `${files[i]} (${i + 1}/${files.length})`);
    if (ok) {
      successCount++;
    } else {
      failCount++;
      // Continue with other batches even if one fails
    }

    // Small delay to avoid rate limiting
    if (i % 10 === 9) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log(`\n=== Results ===`);
  console.log(`Success: ${successCount}/${files.length}`);
  console.log(`Failed: ${failCount}/${files.length}`);

  // Step 3: Verify count
  console.log('\n=== Step 3: Verify count ===');
  const countResp = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'authorization': 'Bearer ' + TOKEN,
      'content-type': 'application/json',
      'x-connection-encrypted': CONN_ENCRYPTED,
      'x-pg-application-name': 'supabase/dashboard-query-editor'
    },
    body: JSON.stringify({ query: "SELECT COUNT(*) as total FROM demands WHERE tenant_id = '89080d1a-bc79-4c3f-8fce-20aabc561c0d';", disable_statement_timeout: true })
  });
  const countData = await countResp.json();
  console.log('Count result:', JSON.stringify(countData));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
