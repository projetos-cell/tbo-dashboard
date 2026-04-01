DO $$
DECLARE
  v_tenant_id UUID;
  v_sop_id UUID;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
  IF v_tenant_id IS NULL THEN
    RAISE NOTICE 'No tenant found.';
    RETURN;
  END IF;
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Propriedade Intelectual e Direitos Autorais',
    'tbo-pol-003-propriedade-intelectual-e-direitos-autorais',
    'politicas',
    'checklist',
    'Propriedade Intelectual e Direitos Autorais',
    'Standard Operating Procedure

Propriedade Intelectual e Direitos Autorais

Código

TBO-POL-003

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Políticas (Compliance)

Responsável

Marco Andolfato (Dir. Operações)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Definir regras de propriedade intelectual para proteger ativos criativos da TBO e direitos dos clientes sobre materiais produzidos.

2. Escopo

2.1 O que está coberto

Propriedade de trabalhos para clientes, ativos internos da TBO, uso de stock e licenças, e cessão de direitos de freelancers.

2.2 Exclusões

Código de conduta (SOP-POL-001), segurança da informação (SOP-POL-002), gestão de contratos (SOP-POL-004).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco

Definir políticas e garantir cláusulas em contratos

Executor

---

Carol (Ops)

Manter registro de licenças, incluir cláusulas em contratos de freelancer

Executor

---

Todos os membros

Seguir as políticas de PI

Executor

---



4. Pré-requisitos

4.1 Inputs necessários

Templates de contrato com cláusulas de PI; registro de licenças de software e stock; política de uso de portfólio.

4.2 Ferramentas e Acessos

TBO OS, Google Drive (registro de licenças), ClickSign.

5. Procedimento Passo a Passo

5.1. Trabalho para Clientes

Ação: Materiais produzidos para cliente são de propriedade do cliente após pagamento integral. TBO retém direito de uso para portfólio, desde que autorizado (por escrito).

Responsável: Marco

Output: Cláusula em contrato

Prazo referência: Em todo contrato

5.2. Ativos Internos da TBO

Ação: Templates, processos, metodologias, ferramentas (TBO OS, Bia, skills) são propriedade exclusiva. Nenhum colaborador pode reproduzir ou utilizar fora do contexto de trabalho.

Responsável: Marco

Output: Política documentada e comunicada

Prazo referência: No onboarding

5.3. Stock e Licenças

Ação: Imagens de stock, fontes e plugins devem ter licença válida. Carol mantém registro de licenças ativas. Uso de material sem licença é proibido.

Responsável: Carol (Ops)

Output: Registro de licenças atualizado

Prazo referência: Contínuo

5.4. Contratos de Freelancer

Ação: Todo contrato com freelancer inclui cláusula de cessão de direitos autorais sobre material produzido para TBO/cliente.

Responsável: Carol (Ops)

Output: Cláusula de cessão em contrato

Prazo referência: Em todo contrato de freelancer

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Cláusula de PI em todos os contratos de cliente

[ ] Cláusula de cessão em todos os contratos de freelancer

[ ] Registro de licenças de stock e software atualizado

[ ] Política de portfólio comunicada a toda equipe

6.2 Erros Comuns a Evitar

Material de cliente em portfólio sem autorização → violação de confiança e possível ação legal

Freelancer sem cessão de direitos → disputa sobre autoria

Software/stock pirata → risco legal e reputacional

7. Ferramentas e Templates

TBO OS, Google Drive, ClickSign.

8. SLAs e Prazos

Cláusula de PI: em todo contrato

Registro de licenças: atualização contínua

Autorização de portfólio: antes de qualquer publicação

Regra: material pré-lançamento é especialmente sensível — publicação proibida sem autorização

9. Fluxograma

Projeto Iniciado → Contrato com Cláusula de PI → Produção (licenças verificadas) → Entrega + Pagamento → Propriedade transferida ao cliente → Usar em portfólio? → Autorização por escrito → Publicar / Não publicar → Fim

10. Glossário

PI: Propriedade Intelectual — direitos sobre criações do intelecto.

Cessão de direitos: transferência formal da autoria de um material.

Stock: banco de imagens, vídeos ou áudio licenciados para uso comercial.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Propriedade Intelectual e Direitos Autorais</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-POL-003</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Políticas (Compliance)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Dir. Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Definir regras de propriedade intelectual para proteger ativos criativos da TBO e direitos dos clientes sobre materiais produzidos.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Propriedade de trabalhos para clientes, ativos internos da TBO, uso de stock e licenças, e cessão de direitos de freelancers.</p><p><strong>2.2 Exclusões</strong></p><p>Código de conduta (SOP-POL-001), segurança da informação (SOP-POL-002), gestão de contratos (SOP-POL-004).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Definir políticas e garantir cláusulas em contratos</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Manter registro de licenças, incluir cláusulas em contratos de freelancer</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Todos os membros</strong></p></td><td><p>Seguir as políticas de PI</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Templates de contrato com cláusulas de PI; registro de licenças de software e stock; política de uso de portfólio.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>TBO OS, Google Drive (registro de licenças), ClickSign.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Trabalho para Clientes</strong></p><p>Ação: Materiais produzidos para cliente são de propriedade do cliente após pagamento integral. TBO retém direito de uso para portfólio, desde que autorizado (por escrito).</p><p>Responsável: Marco</p><p>Output: Cláusula em contrato</p><p>Prazo referência: Em todo contrato</p><p><strong>5.2. Ativos Internos da TBO</strong></p><p>Ação: Templates, processos, metodologias, ferramentas (TBO OS, Bia, skills) são propriedade exclusiva. Nenhum colaborador pode reproduzir ou utilizar fora do contexto de trabalho.</p><p>Responsável: Marco</p><p>Output: Política documentada e comunicada</p><p>Prazo referência: No onboarding</p><p><strong>5.3. Stock e Licenças</strong></p><p>Ação: Imagens de stock, fontes e plugins devem ter licença válida. Carol mantém registro de licenças ativas. Uso de material sem licença é proibido.</p><p>Responsável: Carol (Ops)</p><p>Output: Registro de licenças atualizado</p><p>Prazo referência: Contínuo</p><p><strong>5.4. Contratos de Freelancer</strong></p><p>Ação: Todo contrato com freelancer inclui cláusula de cessão de direitos autorais sobre material produzido para TBO/cliente.</p><p>Responsável: Carol (Ops)</p><p>Output: Cláusula de cessão em contrato</p><p>Prazo referência: Em todo contrato de freelancer</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Cláusula de PI em todos os contratos de cliente</li><li>[ ] Cláusula de cessão em todos os contratos de freelancer</li><li>[ ] Registro de licenças de stock e software atualizado</li><li>[ ] Política de portfólio comunicada a toda equipe</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Material de cliente em portfólio sem autorização → violação de confiança e possível ação legal</li><li>Freelancer sem cessão de direitos → disputa sobre autoria</li><li>Software/stock pirata → risco legal e reputacional</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS, Google Drive, ClickSign.</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Cláusula de PI: em todo contrato</li><li>Registro de licenças: atualização contínua</li><li>Autorização de portfólio: antes de qualquer publicação</li><li>Regra: material pré-lançamento é especialmente sensível — publicação proibida sem autorização</li></ul><p><strong>9. Fluxograma</strong></p><p>Projeto Iniciado → Contrato com Cláusula de PI → Produção (licenças verificadas) → Entrega + Pagamento → Propriedade transferida ao cliente → Usar em portfólio? → Autorização por escrito → Publicar / Não publicar → Fim</p><p><strong>10. Glossário</strong></p><p>PI: Propriedade Intelectual — direitos sobre criações do intelecto.</p><p>Cessão de direitos: transferência formal da autoria de um material.</p><p>Stock: banco de imagens, vídeos ou áudio licenciados para uso comercial.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['politica','compliance','entrega','qualidade','cliente']::TEXT[],
    2,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-POL-003
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Definir regras de propriedade intelectual para proteger ativos criativos da TBO e direitos dos clientes sobre materiais produzidos.', '<p>Definir regras de propriedade intelectual para proteger ativos criativos da TBO e direitos dos clientes sobre materiais produzidos.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Propriedade de trabalhos para clientes, ativos internos da TBO, uso de stock e licenças, e cessão de direitos de freelancers.', '<p>Propriedade de trabalhos para clientes, ativos internos da TBO, uso de stock e licenças, e cessão de direitos de freelancers.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Código de conduta (SOP-POL-001), segurança da informação (SOP-POL-002), gestão de contratos (SOP-POL-004).', '<p>Código de conduta (SOP-POL-001), segurança da informação (SOP-POL-002), gestão de contratos (SOP-POL-004).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco

Definir políticas e garantir cláusulas em contratos

Executor

---

Carol (Ops)

Manter registro de licenças, incluir cláusulas em contratos de freelancer

Executor

---

Todos os membros

Seguir as políticas de PI

Executor

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Definir políticas e garantir cláusulas em contratos</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Manter registro de licenças, incluir cláusulas em contratos de freelancer</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Todos os membros</strong></p></td><td><p>Seguir as políticas de PI</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Templates de contrato com cláusulas de PI; registro de licenças de software e stock; política de uso de portfólio.', '<p>Templates de contrato com cláusulas de PI; registro de licenças de software e stock; política de uso de portfólio.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS, Google Drive (registro de licenças), ClickSign.', '<p>TBO OS, Google Drive (registro de licenças), ClickSign.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Trabalho para Clientes', 'Ação: Materiais produzidos para cliente são de propriedade do cliente após pagamento integral. TBO retém direito de uso para portfólio, desde que autorizado (por escrito).

Responsável: Marco

Output: Cláusula em contrato

Prazo referência: Em todo contrato', '<p>Ação: Materiais produzidos para cliente são de propriedade do cliente após pagamento integral. TBO retém direito de uso para portfólio, desde que autorizado (por escrito).</p><p>Responsável: Marco</p><p>Output: Cláusula em contrato</p><p>Prazo referência: Em todo contrato</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Ativos Internos da TBO', 'Ação: Templates, processos, metodologias, ferramentas (TBO OS, Bia, skills) são propriedade exclusiva. Nenhum colaborador pode reproduzir ou utilizar fora do contexto de trabalho.

Responsável: Marco

Output: Política documentada e comunicada

Prazo referência: No onboarding', '<p>Ação: Templates, processos, metodologias, ferramentas (TBO OS, Bia, skills) são propriedade exclusiva. Nenhum colaborador pode reproduzir ou utilizar fora do contexto de trabalho.</p><p>Responsável: Marco</p><p>Output: Política documentada e comunicada</p><p>Prazo referência: No onboarding</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Stock e Licenças', 'Ação: Imagens de stock, fontes e plugins devem ter licença válida. Carol mantém registro de licenças ativas. Uso de material sem licença é proibido.

Responsável: Carol (Ops)

Output: Registro de licenças atualizado

Prazo referência: Contínuo', '<p>Ação: Imagens de stock, fontes e plugins devem ter licença válida. Carol mantém registro de licenças ativas. Uso de material sem licença é proibido.</p><p>Responsável: Carol (Ops)</p><p>Output: Registro de licenças atualizado</p><p>Prazo referência: Contínuo</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Contratos de Freelancer', 'Ação: Todo contrato com freelancer inclui cláusula de cessão de direitos autorais sobre material produzido para TBO/cliente.

Responsável: Carol (Ops)

Output: Cláusula de cessão em contrato

Prazo referência: Em todo contrato de freelancer', '<p>Ação: Todo contrato com freelancer inclui cláusula de cessão de direitos autorais sobre material produzido para TBO/cliente.</p><p>Responsável: Carol (Ops)</p><p>Output: Cláusula de cessão em contrato</p><p>Prazo referência: Em todo contrato de freelancer</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Cláusula de PI em todos os contratos de cliente

[ ] Cláusula de cessão em todos os contratos de freelancer

[ ] Registro de licenças de stock e software atualizado

[ ] Política de portfólio comunicada a toda equipe', '<ul><li>[ ] Cláusula de PI em todos os contratos de cliente</li><li>[ ] Cláusula de cessão em todos os contratos de freelancer</li><li>[ ] Registro de licenças de stock e software atualizado</li><li>[ ] Política de portfólio comunicada a toda equipe</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Material de cliente em portfólio sem autorização → violação de confiança e possível ação legal

Freelancer sem cessão de direitos → disputa sobre autoria

Software/stock pirata → risco legal e reputacional', '<ul><li>Material de cliente em portfólio sem autorização → violação de confiança e possível ação legal</li><li>Freelancer sem cessão de direitos → disputa sobre autoria</li><li>Software/stock pirata → risco legal e reputacional</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS, Google Drive, ClickSign.', '<p>TBO OS, Google Drive, ClickSign.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Cláusula de PI: em todo contrato

Registro de licenças: atualização contínua

Autorização de portfólio: antes de qualquer publicação

Regra: material pré-lançamento é especialmente sensível — publicação proibida sem autorização', '<ul><li>Cláusula de PI: em todo contrato</li><li>Registro de licenças: atualização contínua</li><li>Autorização de portfólio: antes de qualquer publicação</li><li>Regra: material pré-lançamento é especialmente sensível — publicação proibida sem autorização</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Projeto Iniciado → Contrato com Cláusula de PI → Produção (licenças verificadas) → Entrega + Pagamento → Propriedade transferida ao cliente → Usar em portfólio? → Autorização por escrito → Publicar / Não publicar → Fim', '<p>Projeto Iniciado → Contrato com Cláusula de PI → Produção (licenças verificadas) → Entrega + Pagamento → Propriedade transferida ao cliente → Usar em portfólio? → Autorização por escrito → Publicar / Não publicar → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'PI: Propriedade Intelectual — direitos sobre criações do intelecto.

Cessão de direitos: transferência formal da autoria de um material.

Stock: banco de imagens, vídeos ou áudio licenciados para uso comercial.', '<p>PI: Propriedade Intelectual — direitos sobre criações do intelecto.</p><p>Cessão de direitos: transferência formal da autoria de um material.</p><p>Stock: banco de imagens, vídeos ou áudio licenciados para uso comercial.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-POL-004: Gestao de Contratos e Documentos Legais ──
END $$;