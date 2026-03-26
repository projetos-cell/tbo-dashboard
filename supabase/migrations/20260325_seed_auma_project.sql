-- Seed: Import AUMA project from wearetbo.com.br into website_projects CMS
-- Images start as external URLs; use the CMS "Importar Imagens" feature to migrate to Supabase Storage

INSERT INTO website_projects (
  tenant_id,
  name,
  slug,
  client_name,
  location,
  year,
  category,
  cover_url,
  gallery,
  description,
  highlights,
  services,
  status,
  sort_order,
  seo_title,
  seo_description,
  published_at
)
SELECT
  t.id,
  'AUMA',
  'auma',
  'Grupo Thal',
  'Curitiba, PR',
  2025,
  'branding',
  'https://wearetbo.com.br/assets/portfolio/d3d/auma-fachada.webp',
  ARRAY[
    'https://wearetbo.com.br/assets/portfolio/branding/auma-mockup1.webp',
    'https://wearetbo.com.br/assets/portfolio/branding/auma-mockup2.webp',
    'https://wearetbo.com.br/assets/portfolio/d3d/auma-piscina.webp',
    'https://wearetbo.com.br/assets/portfolio/d3d/auma-fachada-detalhe.webp',
    'https://wearetbo.com.br/assets/portfolio/d3d/auma-hall.webp',
    'https://wearetbo.com.br/assets/portfolio/d3d/auma-salao-festas.webp',
    'https://wearetbo.com.br/assets/portfolio/d3d/auma-academia.webp',
    'https://wearetbo.com.br/assets/portfolio/d3d/auma-decorado-living.webp',
    'https://wearetbo.com.br/assets/portfolio/branding/auma-etiqueta.webp',
    'https://wearetbo.com.br/assets/portfolio/branding/auma-pdv.webp',
    'https://wearetbo.com.br/assets/portfolio/branding/auma-sala.webp'
  ],
  '<p>Naming, conceito de marca, identidade visual, logotipo, universo visual, paleta cromática e manual de aplicação — complementados por perspectivas 3D de alta fidelidade da fachada, áreas comuns e interiores residenciais.</p><h3>Desafio</h3><p>O Grupo Thal precisava de identidade visual e naming que capturassem a exclusividade do empreendimento para um público sofisticado, exigindo branding distintivo e visualizações premium.</p><h3>Resultado</h3><p>O universo visual completo e as diretrizes de marca, combinados com perspectivas 3D de alto padrão, elevaram significativamente o valor percebido do empreendimento e sustentaram a estratégia comercial.</p>',
  ARRAY['Valor percebido elevado', 'Estratégia comercial fortalecida', 'Universo visual completo'],
  ARRAY['Branding', 'Digital 3D', 'Marketing', 'Interiores'],
  'publicado',
  1,
  'AUMA — Branding & 3D | TBO',
  'Naming, identidade visual e perspectivas 3D de alto padrão para o empreendimento AUMA do Grupo Thal em Curitiba.',
  now()
FROM tenants t
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  client_name = EXCLUDED.client_name,
  location = EXCLUDED.location,
  year = EXCLUDED.year,
  cover_url = EXCLUDED.cover_url,
  gallery = EXCLUDED.gallery,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  services = EXCLUDED.services,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;
