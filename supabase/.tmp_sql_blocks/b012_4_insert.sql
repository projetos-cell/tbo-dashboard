INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, status, priority, tags, content, author_id, version, last_reviewed_at)
VALUES (
  (SELECT id FROM tenants LIMIT 1),
  'Processo de Criação e Manutenção de SOPs na TBO',
  'tbo-geral-008-criacao-manutencao-sops',
  'geral',
  'processo',
  'published',
  'high',
  ARRAY['SOP', 'documentação', 'processos', 'conhecimento', 'base de conhecimento', 'manutenção'],
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