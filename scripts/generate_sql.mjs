#!/usr/bin/env node
// Reads import_portfolio_result.json and outputs SQL for upsert

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(__dirname, 'import_portfolio_result.json'), 'utf8'));
const TENANT_ID = '89080d1a-bc79-4c3f-8fce-20aabc561c0d';

function esc(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function escArr(arr) {
  if (!arr || arr.length === 0) return 'ARRAY[]::text[]';
  return `ARRAY[${arr.map(s => esc(s)).join(', ')}]`;
}

const sqls = data.results.map((p, i) => {
  const yearVal = p.year ? p.year : 'NULL';
  const publishedAt = p.published_at ? esc(p.published_at) : 'NULL';

  return `INSERT INTO website_projects (
  tenant_id, name, slug, client_name, location, year, category,
  cover_url, gallery, description, highlights, services,
  status, sort_order, seo_title, seo_description, published_at
) VALUES (
  ${esc(TENANT_ID)},
  ${esc(p.name)},
  ${esc(p.slug)},
  ${esc(p.client_name)},
  ${esc(p.location)},
  ${yearVal},
  ${esc(p.category)},
  ${esc(p.cover_url)},
  ${escArr(p.gallery)},
  ${esc(p.description)},
  ${escArr([p.challenge, p.result].filter(Boolean))},
  ${escArr(p.services)},
  ${esc(p.status)},
  ${p.sort_order},
  ${esc(p.seo_title)},
  ${esc(p.seo_description)},
  ${publishedAt}
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  client_name = EXCLUDED.client_name,
  location = EXCLUDED.location,
  year = EXCLUDED.year,
  category = EXCLUDED.category,
  cover_url = EXCLUDED.cover_url,
  gallery = EXCLUDED.gallery,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  services = EXCLUDED.services,
  status = EXCLUDED.status,
  sort_order = EXCLUDED.sort_order,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  published_at = COALESCE(EXCLUDED.published_at, website_projects.published_at),
  updated_at = now();`;
});

console.log(sqls.join('\n\n'));
