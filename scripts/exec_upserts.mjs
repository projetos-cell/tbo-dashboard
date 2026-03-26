#!/usr/bin/env node
// Reads import_portfolio_result.json and directly upserts via Supabase REST API

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(__dirname, 'import_portfolio_result.json'), 'utf8'));

const SUPABASE_URL = 'https://olnndpultyllyhzxuyxh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sbm5kcHVsdHlsbHloenh1eXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyOTUxNjMsImV4cCI6MjA4Njg3MTE2M30.PPhMqKsYKcRB6GFmWxogcc0HIggkojK0DumiB1NDAXU';
const TENANT_ID = '89080d1a-bc79-4c3f-8fce-20aabc561c0d';

async function upsertProject(p) {
  const body = {
    tenant_id: TENANT_ID,
    name: p.name,
    slug: p.slug,
    client_name: p.client_name,
    location: p.location,
    year: p.year,
    category: p.category,
    cover_url: p.cover_url,
    gallery: p.gallery,
    description: p.description,
    highlights: [p.challenge, p.result].filter(Boolean),
    services: p.services,
    status: p.status,
    sort_order: p.sort_order,
    seo_title: p.seo_title,
    seo_description: p.seo_description,
    published_at: p.published_at,
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/website_projects`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }
  return true;
}

async function main() {
  let created = 0, errors = [];

  for (const p of data.results) {
    try {
      await upsertProject(p);
      created++;
      console.log(`✓ ${p.slug}`);
    } catch (e) {
      errors.push(`${p.slug}: ${e.message}`);
      console.error(`✗ ${p.slug}: ${e.message}`);
    }
  }

  console.log(`\n=== UPSERT COMPLETE ===`);
  console.log(`Upserted: ${created}/${data.results.length}`);
  if (errors.length > 0) {
    console.log(`Errors:`);
    errors.forEach(e => console.log(`  ${e}`));
  }
}

main().catch(console.error);
