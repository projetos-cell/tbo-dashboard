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
    'Gestao de Fornecedores',
    'tbo-rel-001-gestao-de-fornecedores',
    'relacionamentos',
    'checklist',
    'Marco Andolfato (Dir. Operações)',
    'Standard Operating Procedure

Gestão de Fornecedores

Código

TBO-REL-001

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Relacionamentos (Stakeholders)

Responsável

Marco Andolfato (Dir. Operações)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Garantir que a TBO trabalhe com fornecedores qualificados, com termos claros, avaliação contínua e backup para serviços críticos.

2. Escopo

2.1 O que está coberto

Cadastro, qualificação, avaliação de performance pós-projeto, revisão trimestral e manutenção de backup.

2.2 Exclusões

Contratação de colaboradores (SOP-RH), parcerias estratégicas (SOP-REL-002), negociação de contratos de clientes (SOP-COM).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco

Consolidar avaliações, decidir manutenção/substituição

Executor

---

PO da BU

Avaliar fornecedor ao final de cada projeto

Executor

---

Carol (Ops)

Manter cadastro atualizado no TBO OS

Consultor

---



4. Pré-requisitos

4.1 Inputs necessários

Lista de fornecedores ativos; critérios de avaliação definidos; histórico de projetos com fornecedores.

4.2 Ferramentas e Acessos

TBO OS (cadastro e avaliação), Google Drive (contratos e SLAs), E-mail.

5. Procedimento Passo a Passo

5.1. Cadastro e Qualificação

Ação: Todo fornecedor recorrente é cadastrado no TBO OS com: razão social, CNPJ, contato, tipo de serviço, condições comerciais, portfólio/referências. Novos fornecedores passam por projeto-piloto antes de receberem escopo > R$ 10.000.

Responsável: Carol (Ops)

Output: Fornecedor cadastrado e qualificado

Prazo referência: Antes do primeiro projeto

5.2. Avaliação Pós-Projeto

Ação: PO da BU avalia ao final de cada projeto: qualidade (1–5), prazo (1–5), comunicação (1–5), custo-benefício (1–5). Registra no TBO OS.

Responsável: PO da BU

Output: Avaliação registrada

Prazo referência: Até 5 dias após entrega

5.3. Revisão Trimestral

Ação: Marco consolida avaliações e decide: manter, renegociar condições ou buscar alternativa. Fornecedores com média < 3.0 entram em observação.

Responsável: Marco

Output: Decisão registrada, ações definidas

Prazo referência: Trimestral

5.4. Manutenção de Backup

Ação: Para cada serviço crítico (render farm, produtora, gráfica, fotógrafo), manter mínimo 2 fornecedores qualificados e testados.

Responsável: Marco + POs

Output: Lista de backup atualizada

Prazo referência: Contínuo

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Fornecedor cadastrado com dados completos no TBO OS

[ ] Avaliação pós-projeto registrada

[ ] Revisão trimestral realizada

[ ] Backup de fornecedores críticos mantido (mín. 2)

6.2 Erros Comuns a Evitar

Fornecedor sem avaliação → decisão baseada em percepção, não em dados

Dependência de fornecedor único → risco operacional alto

Novo fornecedor sem piloto → qualidade desconhecida em projeto real

7. Ferramentas e Templates

TBO OS (cadastro, avaliação), Google Drive (contratos), E-mail.

8. SLAs e Prazos

Cadastro: antes do primeiro projeto

Avaliação: até 5 dias após entrega

Revisão trimestral: a cada 3 meses

Regra: fornecedor novo não recebe projeto > R$ 10k sem piloto

9. Fluxograma

Novo Fornecedor → Cadastro no TBO OS → Projeto-piloto (se > R$ 10k) → Avaliação Pós-Projeto → Média ≥ 3.0? → Sim: Manter → Revisão Trimestral → Fim / Não: Observação → Buscar Alternativa → Fim

10. Glossário

Projeto-piloto: primeiro trabalho de baixo risco com um fornecedor novo.

SLA: Service Level Agreement — acordo de nível de serviço.

Backup: fornecedor alternativo qualificado para substituição em caso de indisponibilidade.

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Gestão de Fornecedores</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-REL-001</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Relacionamentos (Stakeholders)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Dir. Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Garantir que a TBO trabalhe com fornecedores qualificados, com termos claros, avaliação contínua e backup para serviços críticos.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Cadastro, qualificação, avaliação de performance pós-projeto, revisão trimestral e manutenção de backup.</p><p><strong>2.2 Exclusões</strong></p><p>Contratação de colaboradores (SOP-RH), parcerias estratégicas (SOP-REL-002), negociação de contratos de clientes (SOP-COM).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Consolidar avaliações, decidir manutenção/substituição</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>PO da BU</strong></p></td><td><p>Avaliar fornecedor ao final de cada projeto</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Manter cadastro atualizado no TBO OS</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Lista de fornecedores ativos; critérios de avaliação definidos; histórico de projetos com fornecedores.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>TBO OS (cadastro e avaliação), Google Drive (contratos e SLAs), E-mail.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Cadastro e Qualificação</strong></p><p>Ação: Todo fornecedor recorrente é cadastrado no TBO OS com: razão social, CNPJ, contato, tipo de serviço, condições comerciais, portfólio/referências. Novos fornecedores passam por projeto-piloto antes de receberem escopo &gt; R$ 10.000.</p><p>Responsável: Carol (Ops)</p><p>Output: Fornecedor cadastrado e qualificado</p><p>Prazo referência: Antes do primeiro projeto</p><p><strong>5.2. Avaliação Pós-Projeto</strong></p><p>Ação: PO da BU avalia ao final de cada projeto: qualidade (1–5), prazo (1–5), comunicação (1–5), custo-benefício (1–5). Registra no TBO OS.</p><p>Responsável: PO da BU</p><p>Output: Avaliação registrada</p><p>Prazo referência: Até 5 dias após entrega</p><p><strong>5.3. Revisão Trimestral</strong></p><p>Ação: Marco consolida avaliações e decide: manter, renegociar condições ou buscar alternativa. Fornecedores com média &lt; 3.0 entram em observação.</p><p>Responsável: Marco</p><p>Output: Decisão registrada, ações definidas</p><p>Prazo referência: Trimestral</p><p><strong>5.4. Manutenção de Backup</strong></p><p>Ação: Para cada serviço crítico (render farm, produtora, gráfica, fotógrafo), manter mínimo 2 fornecedores qualificados e testados.</p><p>Responsável: Marco + POs</p><p>Output: Lista de backup atualizada</p><p>Prazo referência: Contínuo</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Fornecedor cadastrado com dados completos no TBO OS</li><li>[ ] Avaliação pós-projeto registrada</li><li>[ ] Revisão trimestral realizada</li><li>[ ] Backup de fornecedores críticos mantido (mín. 2)</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Fornecedor sem avaliação → decisão baseada em percepção, não em dados</li><li>Dependência de fornecedor único → risco operacional alto</li><li>Novo fornecedor sem piloto → qualidade desconhecida em projeto real</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS (cadastro, avaliação), Google Drive (contratos), E-mail.</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Cadastro: antes do primeiro projeto</li><li>Avaliação: até 5 dias após entrega</li><li>Revisão trimestral: a cada 3 meses</li><li>Regra: fornecedor novo não recebe projeto &gt; R$ 10k sem piloto</li></ul><p><strong>9. Fluxograma</strong></p><p>Novo Fornecedor → Cadastro no TBO OS → Projeto-piloto (se &gt; R$ 10k) → Avaliação Pós-Projeto → Média ≥ 3.0? → Sim: Manter → Revisão Trimestral → Fim / Não: Observação → Buscar Alternativa → Fim</p><p><strong>10. Glossário</strong></p><p>Projeto-piloto: primeiro trabalho de baixo risco com um fornecedor novo.</p><p>SLA: Service Level Agreement — acordo de nível de serviço.</p><p>Backup: fornecedor alternativo qualificado para substituição em caso de indisponibilidade.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['relacionamento','parceria','entrega','qualidade','cliente','aprovacao']::TEXT[],
    0,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-REL-001
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Garantir que a TBO trabalhe com fornecedores qualificados, com termos claros, avaliação contínua e backup para serviços críticos.', '<p>Garantir que a TBO trabalhe com fornecedores qualificados, com termos claros, avaliação contínua e backup para serviços críticos.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Cadastro, qualificação, avaliação de performance pós-projeto, revisão trimestral e manutenção de backup.', '<p>Cadastro, qualificação, avaliação de performance pós-projeto, revisão trimestral e manutenção de backup.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Contratação de colaboradores (SOP-RH), parcerias estratégicas (SOP-REL-002), negociação de contratos de clientes (SOP-COM).', '<p>Contratação de colaboradores (SOP-RH), parcerias estratégicas (SOP-REL-002), negociação de contratos de clientes (SOP-COM).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco

Consolidar avaliações, decidir manutenção/substituição

Executor

---

PO da BU

Avaliar fornecedor ao final de cada projeto

Executor

---

Carol (Ops)

Manter cadastro atualizado no TBO OS

Consultor

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Consolidar avaliações, decidir manutenção/substituição</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>PO da BU</strong></p></td><td><p>Avaliar fornecedor ao final de cada projeto</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Manter cadastro atualizado no TBO OS</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Lista de fornecedores ativos; critérios de avaliação definidos; histórico de projetos com fornecedores.', '<p>Lista de fornecedores ativos; critérios de avaliação definidos; histórico de projetos com fornecedores.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS (cadastro e avaliação), Google Drive (contratos e SLAs), E-mail.', '<p>TBO OS (cadastro e avaliação), Google Drive (contratos e SLAs), E-mail.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Cadastro e Qualificação', 'Ação: Todo fornecedor recorrente é cadastrado no TBO OS com: razão social, CNPJ, contato, tipo de serviço, condições comerciais, portfólio/referências. Novos fornecedores passam por projeto-piloto antes de receberem escopo > R$ 10.000.

Responsável: Carol (Ops)

Output: Fornecedor cadastrado e qualificado

Prazo referência: Antes do primeiro projeto', '<p>Ação: Todo fornecedor recorrente é cadastrado no TBO OS com: razão social, CNPJ, contato, tipo de serviço, condições comerciais, portfólio/referências. Novos fornecedores passam por projeto-piloto antes de receberem escopo &gt; R$ 10.000.</p><p>Responsável: Carol (Ops)</p><p>Output: Fornecedor cadastrado e qualificado</p><p>Prazo referência: Antes do primeiro projeto</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Avaliação Pós-Projeto', 'Ação: PO da BU avalia ao final de cada projeto: qualidade (1–5), prazo (1–5), comunicação (1–5), custo-benefício (1–5). Registra no TBO OS.

Responsável: PO da BU

Output: Avaliação registrada

Prazo referência: Até 5 dias após entrega', '<p>Ação: PO da BU avalia ao final de cada projeto: qualidade (1–5), prazo (1–5), comunicação (1–5), custo-benefício (1–5). Registra no TBO OS.</p><p>Responsável: PO da BU</p><p>Output: Avaliação registrada</p><p>Prazo referência: Até 5 dias após entrega</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Revisão Trimestral', 'Ação: Marco consolida avaliações e decide: manter, renegociar condições ou buscar alternativa. Fornecedores com média < 3.0 entram em observação.

Responsável: Marco

Output: Decisão registrada, ações definidas

Prazo referência: Trimestral', '<p>Ação: Marco consolida avaliações e decide: manter, renegociar condições ou buscar alternativa. Fornecedores com média &lt; 3.0 entram em observação.</p><p>Responsável: Marco</p><p>Output: Decisão registrada, ações definidas</p><p>Prazo referência: Trimestral</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Manutenção de Backup', 'Ação: Para cada serviço crítico (render farm, produtora, gráfica, fotógrafo), manter mínimo 2 fornecedores qualificados e testados.

Responsável: Marco + POs

Output: Lista de backup atualizada

Prazo referência: Contínuo', '<p>Ação: Para cada serviço crítico (render farm, produtora, gráfica, fotógrafo), manter mínimo 2 fornecedores qualificados e testados.</p><p>Responsável: Marco + POs</p><p>Output: Lista de backup atualizada</p><p>Prazo referência: Contínuo</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Fornecedor cadastrado com dados completos no TBO OS

[ ] Avaliação pós-projeto registrada

[ ] Revisão trimestral realizada

[ ] Backup de fornecedores críticos mantido (mín. 2)', '<ul><li>[ ] Fornecedor cadastrado com dados completos no TBO OS</li><li>[ ] Avaliação pós-projeto registrada</li><li>[ ] Revisão trimestral realizada</li><li>[ ] Backup de fornecedores críticos mantido (mín. 2)</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Fornecedor sem avaliação → decisão baseada em percepção, não em dados

Dependência de fornecedor único → risco operacional alto

Novo fornecedor sem piloto → qualidade desconhecida em projeto real', '<ul><li>Fornecedor sem avaliação → decisão baseada em percepção, não em dados</li><li>Dependência de fornecedor único → risco operacional alto</li><li>Novo fornecedor sem piloto → qualidade desconhecida em projeto real</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (cadastro, avaliação), Google Drive (contratos), E-mail.', '<p>TBO OS (cadastro, avaliação), Google Drive (contratos), E-mail.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Cadastro: antes do primeiro projeto

Avaliação: até 5 dias após entrega

Revisão trimestral: a cada 3 meses

Regra: fornecedor novo não recebe projeto > R$ 10k sem piloto', '<ul><li>Cadastro: antes do primeiro projeto</li><li>Avaliação: até 5 dias após entrega</li><li>Revisão trimestral: a cada 3 meses</li><li>Regra: fornecedor novo não recebe projeto &gt; R$ 10k sem piloto</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Novo Fornecedor → Cadastro no TBO OS → Projeto-piloto (se > R$ 10k) → Avaliação Pós-Projeto → Média ≥ 3.0? → Sim: Manter → Revisão Trimestral → Fim / Não: Observação → Buscar Alternativa → Fim', '<p>Novo Fornecedor → Cadastro no TBO OS → Projeto-piloto (se &gt; R$ 10k) → Avaliação Pós-Projeto → Média ≥ 3.0? → Sim: Manter → Revisão Trimestral → Fim / Não: Observação → Buscar Alternativa → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Projeto-piloto: primeiro trabalho de baixo risco com um fornecedor novo.

SLA: Service Level Agreement — acordo de nível de serviço.

Backup: fornecedor alternativo qualificado para substituição em caso de indisponibilidade.', '<p>Projeto-piloto: primeiro trabalho de baixo risco com um fornecedor novo.</p><p>SLA: Service Level Agreement — acordo de nível de serviço.</p><p>Backup: fornecedor alternativo qualificado para substituição em caso de indisponibilidade.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-REL-002: Parcerias Estrategicas ──
END $$;