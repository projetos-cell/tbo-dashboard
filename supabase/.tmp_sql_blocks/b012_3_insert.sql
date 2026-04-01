INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, status, priority, tags, content, author_id, version, last_reviewed_at)
VALUES (
  (SELECT id FROM tenants LIMIT 1),
  'Precificação de Projetos por BU: Método e Composição de Preço',
  'tbo-com-009-precificacao-projetos-por-bu',
  'comercial',
  'processo',
  'published',
  'critical',
  ARRAY['precificação', 'proposta', 'preço', 'margem', 'custo', 'comercial', 'BU'],
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