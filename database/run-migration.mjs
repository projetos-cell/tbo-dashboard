#!/usr/bin/env node
// ============================================================================
// TBO OS — Executar migration SQL no Supabase
// Uso: npx supabase db push --db-url "postgresql://..." --include-all
//  OU: node database/run-migration.mjs "postgresql://postgres.olnndpultyllyhzxuyxh:SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
// ============================================================================

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const dbUrl = process.argv[2];
if (!dbUrl) {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  TBO OS — Executar Migration v3 (Multi-tenant + RBAC)        ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  OPCAO 1 (recomendada): Via Supabase Dashboard                 ║
║  1. Abra: https://supabase.com/dashboard/project/              ║
║           olnndpultyllyhzxuyxh/sql/new                         ║
║  2. Cole o conteudo de: database/migration-v3-multitenant.sql  ║
║  3. Clique "Run"                                               ║
║                                                                ║
║  OPCAO 2: Via CLI com database URL                             ║
║  node database/run-migration.mjs "postgresql://..."            ║
║                                                                ║
║  Obtenha a connection string em:                               ║
║  Supabase Dashboard → Settings → Database → Connection string  ║
║  (URI, modo "Transaction")                                     ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);
  process.exit(1);
}

// Dynamically import pg (install if needed)
let pg;
try {
  pg = await import('pg');
} catch {
  console.log('Instalando dependencia pg...');
  const { execSync } = await import('child_process');
  execSync('npm install pg --no-save', { stdio: 'inherit' });
  pg = await import('pg');
}

const { Client } = pg.default || pg;

async function run() {
  const sqlPath = join(__dirname, 'migration-v3-multitenant.sql');
  const sql = readFileSync(sqlPath, 'utf-8');

  console.log('\n[TBO Migration] Conectando ao banco...');
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('[TBO Migration] Executando migration-v3-multitenant.sql...');
  try {
    await client.query(sql);
    console.log('\n✓ Migration executada com sucesso!\n');

    // Verificar tabelas criadas
    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('tenants', 'roles', 'role_permissions', 'tenant_members',
                          'changelog_entries', 'integration_configs', 'sync_logs',
                          'culture_pages', 'collaborator_history')
      ORDER BY table_name
    `);

    console.log('Tabelas criadas/verificadas:');
    rows.forEach(r => console.log(`  ✓ ${r.table_name}`));

    // Verificar seeds
    const tenants = await client.query('SELECT name, slug FROM tenants');
    console.log(`\nTenants: ${tenants.rows.map(r => r.name).join(', ')}`);

    const roles = await client.query('SELECT r.name, t.slug as tenant FROM roles r JOIN tenants t ON r.tenant_id = t.id');
    console.log(`Roles: ${roles.rows.map(r => `${r.name} (${r.tenant})`).join(', ')}`);

    const perms = await client.query('SELECT count(*) as total FROM role_permissions');
    console.log(`Permissions: ${perms.rows[0].total} registros`);

  } catch (e) {
    console.error('\n✗ Erro na migration:', e.message);
    if (e.message.includes('already exists')) {
      console.log('\n(Algumas tabelas ja existiam — isso e esperado se a migration ja foi parcialmente executada)');
    }
  } finally {
    await client.end();
  }
}

run().catch(e => {
  console.error('Erro fatal:', e.message);
  process.exit(1);
});
