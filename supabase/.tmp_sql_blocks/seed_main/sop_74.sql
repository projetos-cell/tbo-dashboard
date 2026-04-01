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
    'Gestao de Reputacao e Presenca Institucional',
    'tbo-rel-003-gestao-de-reputacao-e-presenca-institucional',
    'relacionamentos',
    'checklist',
    'Gestão de Reputação e Presença Institucional',
    'Standard Operating Procedure

Gestão de Reputação e Presença Institucional

Código

TBO-REL-003

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Relacionamentos (Stakeholders)

Responsável

Ruy Lima (CEO/CMO)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Manter a presença institucional da TBO ativa e estratégica, posicionando a marca como referência em branding imobiliário.

2. Escopo

2.1 O que está coberto

LinkedIn dos sócios, Instagram @weare.tbo, participação em eventos/palestras e documentação de cases de sucesso.

2.2 Exclusões

Gestão de social media de clientes (SOP-MKT-011), produção de conteúdo de campanha (SOP-BRD-013), lead magnets comerciais (SOP-COM).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Ruy

Conteúdo LinkedIn semanal, avaliação de eventos

Executor

---

Marco

Conteúdo LinkedIn quinzenal (creative direction), documentação de cases

Executor

---

Nelson (PO Branding)

Gestão do Instagram @weare.tbo

Executor

---



4. Pré-requisitos

4.1 Inputs necessários

Calendário editorial definido; projetos concluídos para cases; convites de eventos avaliados.

4.2 Ferramentas e Acessos

LinkedIn, Instagram, Google Drive (cases), TBO OS.

5. Procedimento Passo a Passo

5.1. LinkedIn dos Sócios

Ação: Ruy publica semanalmente seguindo calendário editorial. Marco publica quinzenalmente com foco em creative direction e bastidores. Estilo: parágrafos densos, tom consultivo, sem chatgptização.

Responsável: Ruy + Marco

Output: Posts publicados conforme calendário

Prazo referência: Semanal (Ruy), quinzenal (Marco)

5.2. Instagram @weare.tbo

Ação: Nelson gerencia feed com cronograma mensal. Conteúdo: projetos entregues, bastidores, insights. Grid cronológico (1→6, inferior direito ao superior esquerdo). Aprovação de pelo menos um sócio antes de publicar.

Responsável: Nelson (PO Branding)

Output: Feed atualizado conforme cronograma

Prazo referência: Conforme calendário mensal

5.3. Eventos e Palestras

Ação: Ruy e Marco avaliam convites. Critérios: público relevante (decisores de incorporadoras), visibilidade, potencial de leads. Máximo 1 evento por mês para não dispersar.

Responsável: Ruy + Marco

Output: Participação em eventos estratégicos

Prazo referência: Conforme convites

5.4. Cases de Sucesso

Ação: Ao final de cada projeto relevante, Marco documenta: desafio, solução, resultados. Requer autorização escrita do cliente. Publicação em LinkedIn, site e propostas.

Responsável: Marco

Output: Case documentado e publicado

Prazo referência: Até 30 dias após entrega final

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] LinkedIn de Ruy: post semanal publicado

[ ] LinkedIn de Marco: post quinzenal publicado

[ ] Instagram: feed atualizado conforme cronograma mensal

[ ] Cases documentados com autorização do cliente

[ ] Eventos avaliados e participação decidida

6.2 Erros Comuns a Evitar

Publicar sem aprovação de sócio → risco de mensagem desalinhada

Case sem autorização do cliente → violação de confiança

Aceitar muitos eventos → dispersão sem retorno

7. Ferramentas e Templates

LinkedIn, Instagram, Google Drive, TBO OS.

8. SLAs e Prazos

LinkedIn Ruy: semanal

LinkedIn Marco: quinzenal

Instagram: conforme calendário mensal

Cases: até 30 dias após entrega

Regra: nenhum conteúdo institucional sem aprovação de sócio; cases requerem autorização escrita do cliente

9. Fluxograma

Calendário Editorial → Produção de Conteúdo → Aprovação de Sócio → Publicação (LinkedIn/Instagram) → Projeto Entregue? → Sim: Documentar Case → Autorização do Cliente → Publicar Case → Fim

10. Glossário

Case de sucesso: documentação estruturada de um projeto mostrando desafio, solução e resultado.

Calendário editorial: planejamento mensal de conteúdo para redes sociais e LinkedIn.

Grid cronológico: ordem de publicação do feed Instagram (1→6, inferior direito ao superior esquerdo).

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Gestão de Reputação e Presença Institucional</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-REL-003</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Relacionamentos (Stakeholders)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Ruy Lima (CEO/CMO)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Manter a presença institucional da TBO ativa e estratégica, posicionando a marca como referência em branding imobiliário.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>LinkedIn dos sócios, Instagram @weare.tbo, participação em eventos/palestras e documentação de cases de sucesso.</p><p><strong>2.2 Exclusões</strong></p><p>Gestão de social media de clientes (SOP-MKT-011), produção de conteúdo de campanha (SOP-BRD-013), lead magnets comerciais (SOP-COM).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Conteúdo LinkedIn semanal, avaliação de eventos</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Conteúdo LinkedIn quinzenal (creative direction), documentação de cases</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Nelson (PO Branding)</strong></p></td><td><p>Gestão do Instagram @weare.tbo</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Calendário editorial definido; projetos concluídos para cases; convites de eventos avaliados.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>LinkedIn, Instagram, Google Drive (cases), TBO OS.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. LinkedIn dos Sócios</strong></p><p>Ação: Ruy publica semanalmente seguindo calendário editorial. Marco publica quinzenalmente com foco em creative direction e bastidores. Estilo: parágrafos densos, tom consultivo, sem chatgptização.</p><p>Responsável: Ruy + Marco</p><p>Output: Posts publicados conforme calendário</p><p>Prazo referência: Semanal (Ruy), quinzenal (Marco)</p><p><strong>5.2. Instagram @weare.tbo</strong></p><p>Ação: Nelson gerencia feed com cronograma mensal. Conteúdo: projetos entregues, bastidores, insights. Grid cronológico (1→6, inferior direito ao superior esquerdo). Aprovação de pelo menos um sócio antes de publicar.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Feed atualizado conforme cronograma</p><p>Prazo referência: Conforme calendário mensal</p><p><strong>5.3. Eventos e Palestras</strong></p><p>Ação: Ruy e Marco avaliam convites. Critérios: público relevante (decisores de incorporadoras), visibilidade, potencial de leads. Máximo 1 evento por mês para não dispersar.</p><p>Responsável: Ruy + Marco</p><p>Output: Participação em eventos estratégicos</p><p>Prazo referência: Conforme convites</p><p><strong>5.4. Cases de Sucesso</strong></p><p>Ação: Ao final de cada projeto relevante, Marco documenta: desafio, solução, resultados. Requer autorização escrita do cliente. Publicação em LinkedIn, site e propostas.</p><p>Responsável: Marco</p><p>Output: Case documentado e publicado</p><p>Prazo referência: Até 30 dias após entrega final</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] LinkedIn de Ruy: post semanal publicado</li><li>[ ] LinkedIn de Marco: post quinzenal publicado</li><li>[ ] Instagram: feed atualizado conforme cronograma mensal</li><li>[ ] Cases documentados com autorização do cliente</li><li>[ ] Eventos avaliados e participação decidida</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Publicar sem aprovação de sócio → risco de mensagem desalinhada</li><li>Case sem autorização do cliente → violação de confiança</li><li>Aceitar muitos eventos → dispersão sem retorno</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>LinkedIn, Instagram, Google Drive, TBO OS.</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>LinkedIn Ruy: semanal</li><li>LinkedIn Marco: quinzenal</li><li>Instagram: conforme calendário mensal</li><li>Cases: até 30 dias após entrega</li><li>Regra: nenhum conteúdo institucional sem aprovação de sócio; cases requerem autorização escrita do cliente</li></ul><p><strong>9. Fluxograma</strong></p><p>Calendário Editorial → Produção de Conteúdo → Aprovação de Sócio → Publicação (LinkedIn/Instagram) → Projeto Entregue? → Sim: Documentar Case → Autorização do Cliente → Publicar Case → Fim</p><p><strong>10. Glossário</strong></p><p>Case de sucesso: documentação estruturada de um projeto mostrando desafio, solução e resultado.</p><p>Calendário editorial: planejamento mensal de conteúdo para redes sociais e LinkedIn.</p><p>Grid cronológico: ordem de publicação do feed Instagram (1→6, inferior direito ao superior esquerdo).</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['relacionamento','parceria','entrega','qualidade','cliente','aprovacao']::TEXT[],
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

  -- Steps for TBO-REL-003
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Manter a presença institucional da TBO ativa e estratégica, posicionando a marca como referência em branding imobiliário.', '<p>Manter a presença institucional da TBO ativa e estratégica, posicionando a marca como referência em branding imobiliário.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'LinkedIn dos sócios, Instagram @weare.tbo, participação em eventos/palestras e documentação de cases de sucesso.', '<p>LinkedIn dos sócios, Instagram @weare.tbo, participação em eventos/palestras e documentação de cases de sucesso.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Gestão de social media de clientes (SOP-MKT-011), produção de conteúdo de campanha (SOP-BRD-013), lead magnets comerciais (SOP-COM).', '<p>Gestão de social media de clientes (SOP-MKT-011), produção de conteúdo de campanha (SOP-BRD-013), lead magnets comerciais (SOP-COM).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Ruy

Conteúdo LinkedIn semanal, avaliação de eventos

Executor

---

Marco

Conteúdo LinkedIn quinzenal (creative direction), documentação de cases

Executor

---

Nelson (PO Branding)

Gestão do Instagram @weare.tbo

Executor

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Conteúdo LinkedIn semanal, avaliação de eventos</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Conteúdo LinkedIn quinzenal (creative direction), documentação de cases</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Nelson (PO Branding)</strong></p></td><td><p>Gestão do Instagram @weare.tbo</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Calendário editorial definido; projetos concluídos para cases; convites de eventos avaliados.', '<p>Calendário editorial definido; projetos concluídos para cases; convites de eventos avaliados.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'LinkedIn, Instagram, Google Drive (cases), TBO OS.', '<p>LinkedIn, Instagram, Google Drive (cases), TBO OS.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. LinkedIn dos Sócios', 'Ação: Ruy publica semanalmente seguindo calendário editorial. Marco publica quinzenalmente com foco em creative direction e bastidores. Estilo: parágrafos densos, tom consultivo, sem chatgptização.

Responsável: Ruy + Marco

Output: Posts publicados conforme calendário

Prazo referência: Semanal (Ruy), quinzenal (Marco)', '<p>Ação: Ruy publica semanalmente seguindo calendário editorial. Marco publica quinzenalmente com foco em creative direction e bastidores. Estilo: parágrafos densos, tom consultivo, sem chatgptização.</p><p>Responsável: Ruy + Marco</p><p>Output: Posts publicados conforme calendário</p><p>Prazo referência: Semanal (Ruy), quinzenal (Marco)</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Instagram @weare.tbo', 'Ação: Nelson gerencia feed com cronograma mensal. Conteúdo: projetos entregues, bastidores, insights. Grid cronológico (1→6, inferior direito ao superior esquerdo). Aprovação de pelo menos um sócio antes de publicar.

Responsável: Nelson (PO Branding)

Output: Feed atualizado conforme cronograma

Prazo referência: Conforme calendário mensal', '<p>Ação: Nelson gerencia feed com cronograma mensal. Conteúdo: projetos entregues, bastidores, insights. Grid cronológico (1→6, inferior direito ao superior esquerdo). Aprovação de pelo menos um sócio antes de publicar.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Feed atualizado conforme cronograma</p><p>Prazo referência: Conforme calendário mensal</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Eventos e Palestras', 'Ação: Ruy e Marco avaliam convites. Critérios: público relevante (decisores de incorporadoras), visibilidade, potencial de leads. Máximo 1 evento por mês para não dispersar.

Responsável: Ruy + Marco

Output: Participação em eventos estratégicos

Prazo referência: Conforme convites', '<p>Ação: Ruy e Marco avaliam convites. Critérios: público relevante (decisores de incorporadoras), visibilidade, potencial de leads. Máximo 1 evento por mês para não dispersar.</p><p>Responsável: Ruy + Marco</p><p>Output: Participação em eventos estratégicos</p><p>Prazo referência: Conforme convites</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Cases de Sucesso', 'Ação: Ao final de cada projeto relevante, Marco documenta: desafio, solução, resultados. Requer autorização escrita do cliente. Publicação em LinkedIn, site e propostas.

Responsável: Marco

Output: Case documentado e publicado

Prazo referência: Até 30 dias após entrega final', '<p>Ação: Ao final de cada projeto relevante, Marco documenta: desafio, solução, resultados. Requer autorização escrita do cliente. Publicação em LinkedIn, site e propostas.</p><p>Responsável: Marco</p><p>Output: Case documentado e publicado</p><p>Prazo referência: Até 30 dias após entrega final</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] LinkedIn de Ruy: post semanal publicado

[ ] LinkedIn de Marco: post quinzenal publicado

[ ] Instagram: feed atualizado conforme cronograma mensal

[ ] Cases documentados com autorização do cliente

[ ] Eventos avaliados e participação decidida', '<ul><li>[ ] LinkedIn de Ruy: post semanal publicado</li><li>[ ] LinkedIn de Marco: post quinzenal publicado</li><li>[ ] Instagram: feed atualizado conforme cronograma mensal</li><li>[ ] Cases documentados com autorização do cliente</li><li>[ ] Eventos avaliados e participação decidida</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Publicar sem aprovação de sócio → risco de mensagem desalinhada

Case sem autorização do cliente → violação de confiança

Aceitar muitos eventos → dispersão sem retorno', '<ul><li>Publicar sem aprovação de sócio → risco de mensagem desalinhada</li><li>Case sem autorização do cliente → violação de confiança</li><li>Aceitar muitos eventos → dispersão sem retorno</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'LinkedIn, Instagram, Google Drive, TBO OS.', '<p>LinkedIn, Instagram, Google Drive, TBO OS.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'LinkedIn Ruy: semanal

LinkedIn Marco: quinzenal

Instagram: conforme calendário mensal

Cases: até 30 dias após entrega

Regra: nenhum conteúdo institucional sem aprovação de sócio; cases requerem autorização escrita do cliente', '<ul><li>LinkedIn Ruy: semanal</li><li>LinkedIn Marco: quinzenal</li><li>Instagram: conforme calendário mensal</li><li>Cases: até 30 dias após entrega</li><li>Regra: nenhum conteúdo institucional sem aprovação de sócio; cases requerem autorização escrita do cliente</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Calendário Editorial → Produção de Conteúdo → Aprovação de Sócio → Publicação (LinkedIn/Instagram) → Projeto Entregue? → Sim: Documentar Case → Autorização do Cliente → Publicar Case → Fim', '<p>Calendário Editorial → Produção de Conteúdo → Aprovação de Sócio → Publicação (LinkedIn/Instagram) → Projeto Entregue? → Sim: Documentar Case → Autorização do Cliente → Publicar Case → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Case de sucesso: documentação estruturada de um projeto mostrando desafio, solução e resultado.

Calendário editorial: planejamento mensal de conteúdo para redes sociais e LinkedIn.

Grid cronológico: ordem de publicação do feed Instagram (1→6, inferior direito ao superior esquerdo).', '<p>Case de sucesso: documentação estruturada de um projeto mostrando desafio, solução e resultado.</p><p>Calendário editorial: planejamento mensal de conteúdo para redes sociais e LinkedIn.</p><p>Grid cronológico: ordem de publicação do feed Instagram (1→6, inferior direito ao superior esquerdo).</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-POL-001: Codigo de Conduta e Etica ──
END $$;