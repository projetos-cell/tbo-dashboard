INSERT INTO demands (
  tenant_id, project_id, title, status, responsible,
  due_date, due_date_end, bus, info, prioridade,
  formalizacao, tipo_midia, subitem, item_principal,
  feito, milestones, notion_project_name, notion_page_id
) VALUES
('89080d1a-bc79-4c3f-8fce-20aabc561c0d', (SELECT id FROM projects WHERE notion_page_id = '1f3b27ff29e381a1a7f4d44249377cc3' AND tenant_id = '89080d1a-bc79-4c3f-8fce-20aabc561c0d' LIMIT 1), 'Briefing Branding Tráfego Pago 2 criativos', 'Pausado', 'Rafaela Oltramari', '2026-02-23', '2026-02-25', '{"Marketing"}', NULL, 'Prioridade', NULL, '{"Mídia ON"}', NULL, NULL, FALSE, NULL, 'Porto Alto', '1f3b27ff29e381a1a7f4d44249377cc3'),
(*);