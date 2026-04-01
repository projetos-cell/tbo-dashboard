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
    'Parcerias Estrategicas',
    'tbo-rel-002-parcerias-estrategicas',
    'relacionamentos',
    'checklist',
    'Estruturar o desenvolvimento de parcerias que ampliem alcance, capacidade e posicionamento da TBO no mercado imobiliário.',
    'Standard Operating Procedure

Parcerias Estratégicas

Código

TBO-REL-002

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

Estruturar o desenvolvimento de parcerias que ampliem alcance, capacidade e posicionamento da TBO no mercado imobiliário.

2. Escopo

2.1 O que está coberto

Identificação de oportunidades, abordagem, formalização e nutrição de parcerias complementares, tecnológicas, institucionais e educacionais.

2.2 Exclusões

Gestão de fornecedores operacionais (SOP-REL-001), prospecção de clientes (SOP-COM-001), gestão de reputação (SOP-REL-003).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Ruy

Identificar, abordar e nutrir parcerias

Executor

---

Marco

Co-avaliar oportunidades e aprovar termos

Aprovador

---



4. Pré-requisitos

4.1 Inputs necessários

Mapa de stakeholders do setor imobiliário; calendário de eventos; posicionamento estratégico da TBO.

4.2 Ferramentas e Acessos

LinkedIn, Google Meet, TBO OS (registro), E-mail, ClickSign (termos de parceria).

5. Procedimento Passo a Passo

5.1. Identificação (trimestral)

Ação: Ruy e Marco mapeiam oportunidades de parceria. Tipos: complementar (arquitetura, interiores, consultoria de vendas), tecnológica (plataformas, SaaS), institucional (ADEMI, Sinduscon), educacional (universidades, TBO Academy). Critérios: alinhamento de público, complementaridade, reputação, potencial de leads.

Responsável: Ruy + Marco

Output: Lista de oportunidades priorizada

Prazo referência: Trimestral

5.2. Abordagem

Ação: Ruy lidera abordagem via LinkedIn, evento ou indicação. Primeira reunião com pauta: apresentação mútua, oportunidades conjuntas, modelo de colaboração.

Responsável: Ruy

Output: Primeira reunião realizada

Prazo referência: Conforme oportunidade

5.3. Formalização

Ação: Parcerias com implicação financeira (comissão, co-branding, divisão de receita) formalizadas via termo escrito (ClickSign). Parcerias informais registradas no TBO OS.

Responsável: Ruy + Marco

Output: Parceria formalizada ou registrada

Prazo referência: Antes do primeiro projeto conjunto

5.4. Nutrição

Ação: Ruy mantém contato com parceiros-chave a cada 60 dias. Resultados avaliados semestralmente. Se sem geração de valor em 12 meses, reclassificar.

Responsável: Ruy

Output: Parceria ativa e gerando valor

Prazo referência: Contínuo (check a cada 60 dias)

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Mapa de parcerias atualizado trimestralmente

[ ] Parcerias financeiras formalizadas por escrito

[ ] Contato com parceiros-chave a cada 60 dias

[ ] Avaliação semestral de resultados

6.2 Erros Comuns a Evitar

Parceria sem termo escrito → desentendimento sobre comissão ou co-branding

Não nutrir relacionamento → parceria esfria e morre

Muitas parcerias sem foco → dispersão sem resultado

7. Ferramentas e Templates

LinkedIn, Google Meet, TBO OS, ClickSign, E-mail.

8. SLAs e Prazos

Mapeamento: trimestral

Nutrição: contato a cada 60 dias

Avaliação: semestral

Regra: toda parceria com divisão de receita requer termo escrito

9. Fluxograma

Mapeamento Trimestral → Oportunidade Priorizada → Abordagem (Ruy) → Interesse Mútuo? → Sim: Formalização → Nutrição a cada 60d → Avaliação Semestral → Gerando valor? → Sim: Manter / Não: Reclassificar → Fim

10. Glossário

Parceria complementar: empresa que oferece serviço adjacente ao da TBO.

Co-branding: uso conjunto das marcas em ação ou material.

Nutrição: manutenção ativa do relacionamento ao longo do tempo.

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Parcerias Estratégicas</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-REL-002</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Relacionamentos (Stakeholders)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Ruy Lima (CEO/CMO)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Estruturar o desenvolvimento de parcerias que ampliem alcance, capacidade e posicionamento da TBO no mercado imobiliário.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Identificação de oportunidades, abordagem, formalização e nutrição de parcerias complementares, tecnológicas, institucionais e educacionais.</p><p><strong>2.2 Exclusões</strong></p><p>Gestão de fornecedores operacionais (SOP-REL-001), prospecção de clientes (SOP-COM-001), gestão de reputação (SOP-REL-003).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Identificar, abordar e nutrir parcerias</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Co-avaliar oportunidades e aprovar termos</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Mapa de stakeholders do setor imobiliário; calendário de eventos; posicionamento estratégico da TBO.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>LinkedIn, Google Meet, TBO OS (registro), E-mail, ClickSign (termos de parceria).</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Identificação (trimestral)</strong></p><p>Ação: Ruy e Marco mapeiam oportunidades de parceria. Tipos: complementar (arquitetura, interiores, consultoria de vendas), tecnológica (plataformas, SaaS), institucional (ADEMI, Sinduscon), educacional (universidades, TBO Academy). Critérios: alinhamento de público, complementaridade, reputação, potencial de leads.</p><p>Responsável: Ruy + Marco</p><p>Output: Lista de oportunidades priorizada</p><p>Prazo referência: Trimestral</p><p><strong>5.2. Abordagem</strong></p><p>Ação: Ruy lidera abordagem via LinkedIn, evento ou indicação. Primeira reunião com pauta: apresentação mútua, oportunidades conjuntas, modelo de colaboração.</p><p>Responsável: Ruy</p><p>Output: Primeira reunião realizada</p><p>Prazo referência: Conforme oportunidade</p><p><strong>5.3. Formalização</strong></p><p>Ação: Parcerias com implicação financeira (comissão, co-branding, divisão de receita) formalizadas via termo escrito (ClickSign). Parcerias informais registradas no TBO OS.</p><p>Responsável: Ruy + Marco</p><p>Output: Parceria formalizada ou registrada</p><p>Prazo referência: Antes do primeiro projeto conjunto</p><p><strong>5.4. Nutrição</strong></p><p>Ação: Ruy mantém contato com parceiros-chave a cada 60 dias. Resultados avaliados semestralmente. Se sem geração de valor em 12 meses, reclassificar.</p><p>Responsável: Ruy</p><p>Output: Parceria ativa e gerando valor</p><p>Prazo referência: Contínuo (check a cada 60 dias)</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Mapa de parcerias atualizado trimestralmente</li><li>[ ] Parcerias financeiras formalizadas por escrito</li><li>[ ] Contato com parceiros-chave a cada 60 dias</li><li>[ ] Avaliação semestral de resultados</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Parceria sem termo escrito → desentendimento sobre comissão ou co-branding</li><li>Não nutrir relacionamento → parceria esfria e morre</li><li>Muitas parcerias sem foco → dispersão sem resultado</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>LinkedIn, Google Meet, TBO OS, ClickSign, E-mail.</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Mapeamento: trimestral</li><li>Nutrição: contato a cada 60 dias</li><li>Avaliação: semestral</li><li>Regra: toda parceria com divisão de receita requer termo escrito</li></ul><p><strong>9. Fluxograma</strong></p><p>Mapeamento Trimestral → Oportunidade Priorizada → Abordagem (Ruy) → Interesse Mútuo? → Sim: Formalização → Nutrição a cada 60d → Avaliação Semestral → Gerando valor? → Sim: Manter / Não: Reclassificar → Fim</p><p><strong>10. Glossário</strong></p><p>Parceria complementar: empresa que oferece serviço adjacente ao da TBO.</p><p>Co-branding: uso conjunto das marcas em ação ou material.</p><p>Nutrição: manutenção ativa do relacionamento ao longo do tempo.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['relacionamento','parceria','entrega','qualidade','cliente']::TEXT[],
    1,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-REL-002
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Estruturar o desenvolvimento de parcerias que ampliem alcance, capacidade e posicionamento da TBO no mercado imobiliário.', '<p>Estruturar o desenvolvimento de parcerias que ampliem alcance, capacidade e posicionamento da TBO no mercado imobiliário.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Identificação de oportunidades, abordagem, formalização e nutrição de parcerias complementares, tecnológicas, institucionais e educacionais.', '<p>Identificação de oportunidades, abordagem, formalização e nutrição de parcerias complementares, tecnológicas, institucionais e educacionais.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Gestão de fornecedores operacionais (SOP-REL-001), prospecção de clientes (SOP-COM-001), gestão de reputação (SOP-REL-003).', '<p>Gestão de fornecedores operacionais (SOP-REL-001), prospecção de clientes (SOP-COM-001), gestão de reputação (SOP-REL-003).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Ruy

Identificar, abordar e nutrir parcerias

Executor

---

Marco

Co-avaliar oportunidades e aprovar termos

Aprovador

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Identificar, abordar e nutrir parcerias</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Co-avaliar oportunidades e aprovar termos</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Mapa de stakeholders do setor imobiliário; calendário de eventos; posicionamento estratégico da TBO.', '<p>Mapa de stakeholders do setor imobiliário; calendário de eventos; posicionamento estratégico da TBO.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'LinkedIn, Google Meet, TBO OS (registro), E-mail, ClickSign (termos de parceria).', '<p>LinkedIn, Google Meet, TBO OS (registro), E-mail, ClickSign (termos de parceria).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Identificação (trimestral)', 'Ação: Ruy e Marco mapeiam oportunidades de parceria. Tipos: complementar (arquitetura, interiores, consultoria de vendas), tecnológica (plataformas, SaaS), institucional (ADEMI, Sinduscon), educacional (universidades, TBO Academy). Critérios: alinhamento de público, complementaridade, reputação, potencial de leads.

Responsável: Ruy + Marco

Output: Lista de oportunidades priorizada

Prazo referência: Trimestral', '<p>Ação: Ruy e Marco mapeiam oportunidades de parceria. Tipos: complementar (arquitetura, interiores, consultoria de vendas), tecnológica (plataformas, SaaS), institucional (ADEMI, Sinduscon), educacional (universidades, TBO Academy). Critérios: alinhamento de público, complementaridade, reputação, potencial de leads.</p><p>Responsável: Ruy + Marco</p><p>Output: Lista de oportunidades priorizada</p><p>Prazo referência: Trimestral</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Abordagem', 'Ação: Ruy lidera abordagem via LinkedIn, evento ou indicação. Primeira reunião com pauta: apresentação mútua, oportunidades conjuntas, modelo de colaboração.

Responsável: Ruy

Output: Primeira reunião realizada

Prazo referência: Conforme oportunidade', '<p>Ação: Ruy lidera abordagem via LinkedIn, evento ou indicação. Primeira reunião com pauta: apresentação mútua, oportunidades conjuntas, modelo de colaboração.</p><p>Responsável: Ruy</p><p>Output: Primeira reunião realizada</p><p>Prazo referência: Conforme oportunidade</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Formalização', 'Ação: Parcerias com implicação financeira (comissão, co-branding, divisão de receita) formalizadas via termo escrito (ClickSign). Parcerias informais registradas no TBO OS.

Responsável: Ruy + Marco

Output: Parceria formalizada ou registrada

Prazo referência: Antes do primeiro projeto conjunto', '<p>Ação: Parcerias com implicação financeira (comissão, co-branding, divisão de receita) formalizadas via termo escrito (ClickSign). Parcerias informais registradas no TBO OS.</p><p>Responsável: Ruy + Marco</p><p>Output: Parceria formalizada ou registrada</p><p>Prazo referência: Antes do primeiro projeto conjunto</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Nutrição', 'Ação: Ruy mantém contato com parceiros-chave a cada 60 dias. Resultados avaliados semestralmente. Se sem geração de valor em 12 meses, reclassificar.

Responsável: Ruy

Output: Parceria ativa e gerando valor

Prazo referência: Contínuo (check a cada 60 dias)', '<p>Ação: Ruy mantém contato com parceiros-chave a cada 60 dias. Resultados avaliados semestralmente. Se sem geração de valor em 12 meses, reclassificar.</p><p>Responsável: Ruy</p><p>Output: Parceria ativa e gerando valor</p><p>Prazo referência: Contínuo (check a cada 60 dias)</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Mapa de parcerias atualizado trimestralmente

[ ] Parcerias financeiras formalizadas por escrito

[ ] Contato com parceiros-chave a cada 60 dias

[ ] Avaliação semestral de resultados', '<ul><li>[ ] Mapa de parcerias atualizado trimestralmente</li><li>[ ] Parcerias financeiras formalizadas por escrito</li><li>[ ] Contato com parceiros-chave a cada 60 dias</li><li>[ ] Avaliação semestral de resultados</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Parceria sem termo escrito → desentendimento sobre comissão ou co-branding

Não nutrir relacionamento → parceria esfria e morre

Muitas parcerias sem foco → dispersão sem resultado', '<ul><li>Parceria sem termo escrito → desentendimento sobre comissão ou co-branding</li><li>Não nutrir relacionamento → parceria esfria e morre</li><li>Muitas parcerias sem foco → dispersão sem resultado</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'LinkedIn, Google Meet, TBO OS, ClickSign, E-mail.', '<p>LinkedIn, Google Meet, TBO OS, ClickSign, E-mail.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Mapeamento: trimestral

Nutrição: contato a cada 60 dias

Avaliação: semestral

Regra: toda parceria com divisão de receita requer termo escrito', '<ul><li>Mapeamento: trimestral</li><li>Nutrição: contato a cada 60 dias</li><li>Avaliação: semestral</li><li>Regra: toda parceria com divisão de receita requer termo escrito</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Mapeamento Trimestral → Oportunidade Priorizada → Abordagem (Ruy) → Interesse Mútuo? → Sim: Formalização → Nutrição a cada 60d → Avaliação Semestral → Gerando valor? → Sim: Manter / Não: Reclassificar → Fim', '<p>Mapeamento Trimestral → Oportunidade Priorizada → Abordagem (Ruy) → Interesse Mútuo? → Sim: Formalização → Nutrição a cada 60d → Avaliação Semestral → Gerando valor? → Sim: Manter / Não: Reclassificar → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Parceria complementar: empresa que oferece serviço adjacente ao da TBO.

Co-branding: uso conjunto das marcas em ação ou material.

Nutrição: manutenção ativa do relacionamento ao longo do tempo.', '<p>Parceria complementar: empresa que oferece serviço adjacente ao da TBO.</p><p>Co-branding: uso conjunto das marcas em ação ou material.</p><p>Nutrição: manutenção ativa do relacionamento ao longo do tempo.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-REL-003: Gestao de Reputacao e Presenca Institucional ──
END $$;