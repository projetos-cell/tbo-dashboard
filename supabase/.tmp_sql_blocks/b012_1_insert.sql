INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, status, priority, tags, content, author_id, version, last_reviewed_at)
VALUES (
  (SELECT id FROM tenants LIMIT 1),
  'Pós-produção Audiovisual: Edição, Color Grading e Finalização',
  'tbo-av-009-pos-producao-edicao-color-finalizacao',
  'audiovisual',
  'processo',
  'published',
  'critical',
  ARRAY['pós-produção', 'edição', 'color grading', 'finalização', 'audiovisual', 'entrega'],
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