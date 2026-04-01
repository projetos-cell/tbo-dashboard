INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, status, priority, tags, content, author_id, version, last_reviewed_at)
VALUES (
  (SELECT id FROM tenants LIMIT 1),
  'Fluxo D3D Pipeline: Gestão de Produção 3D do Briefing à Entrega',
  'tbo-3d-015-fluxo-d3d-pipeline-producao',
  'digital-3d',
  'processo',
  'published',
  'critical',
  ARRAY['pipeline', 'd3d', 'gestão de produção', 'fluxo', '3d', 'kanban', 'cronograma'],
  'placeholder',
  NULL,
  1,
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  author_id = EXCLUDED.author_id,
  updated_at = now();