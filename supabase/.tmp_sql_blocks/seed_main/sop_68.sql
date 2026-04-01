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
    'Recrutamento e Selecao',
    'tbo-rh-001-recrutamento-e-selecao',
    'recursos-humanos',
    'checklist',
    'Marco Andolfato (Dir. Operações)',
    'Standard Operating Procedure

Recrutamento e Seleção

Código

TBO-RH-001

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Recursos Humanos (People)

Responsável

Marco Andolfato (Dir. Operações)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Padronizar o processo de contratação para garantir alinhamento cultural, competência técnica e eficiência no tempo de preenchimento de vagas.

2. Escopo

2.1 O que está coberto

Abertura de vaga, descrição e divulgação, triagem com teste prático, entrevistas (2–3 etapas) e decisão de oferta.

2.2 Exclusões

Onboarding pós-contratação (SOP-RH-002), avaliação de performance (SOP-RH-003), contratação de freelancers pontuais (SOP-REL-001).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco

Triagem, entrevista cultural/técnica, decisão final

Executor

---

PO da BU

Entrevista técnica e validação de fit para a área

Consultor

---

Ruy

Entrevista final para cargos de liderança ou senioridade alta

Aprovador

---

Carol (Ops)

Logística de agenda, documentação, setup de contrato

Executor

---



4. Pré-requisitos

4.1 Inputs necessários

Requisição de vaga aprovada; faixa salarial validada; descrição de cargo; case de teste técnico preparado.

4.2 Ferramentas e Acessos

LinkedIn (divulgação), Behance/GitHub (portfólio), Google Meet (entrevistas), ClickSign (contrato), TBO OS (registro).

5. Procedimento Passo a Passo

5.1. Abertura de Vaga

Ação: PO preenche requisição no TBO OS: cargo, senioridade, regime (CLT/PJ), faixa salarial, justificativa. Marco valida necessidade e impacto financeiro. Acima de R$ 5.000/mês: aprovação conjunta.

Responsável: PO → Marco (→ Ruy)

Output: Vaga aprovada

Prazo referência: Até 48h

5.2. Descrição e Divulgação

Ação: Marco elabora descrição (responsabilidades, requisitos, diferenciais, benefícios). Divulgação em: LinkedIn, plataformas de nicho, indicação interna.

Responsável: Marco

Output: Vaga publicada

Prazo referência: Até 3 dias após aprovação

5.3. Triagem e Teste Prático

Ação: Marco faz triagem de portfólio/CV. Aprovados recebem case simulado do dia a dia TBO. Prazo de entrega: 5 dias úteis.

Responsável: Marco

Output: Candidatos pré-selecionados

Prazo referência: Até 10 dias após publicação

5.4. Entrevistas e Decisão

Ação: Etapa 1: fit cultural + técnica (Marco, 45 min). Etapa 2: validação com PO (30 min). Etapa 3: conversa com Ruy (liderança/sênior). Decisão registrada no TBO OS. Oferta enviada por e-mail.

Responsável: Marco + PO + Ruy

Output: Candidato selecionado e oferta enviada

Prazo referência: Até 5 dias após entrevistas

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Requisição preenchida e aprovada

[ ] Vaga publicada nos canais definidos

[ ] Triagem com teste prático realizada

[ ] Mínimo 2 entrevistas concluídas

[ ] Decisão registrada no TBO OS

[ ] Oferta enviada com condições claras

6.2 Erros Comuns a Evitar

Contratar sem teste prático → descobre incompatibilidade técnica tarde demais

Pular entrevista cultural → contratação desalinhada com valores TBO

Processo > 30 dias → perde candidatos bons para concorrência

7. Ferramentas e Templates

TBO OS (requisição, registro), LinkedIn (divulgação), Behance/GitHub (portfólio), Google Meet (entrevistas), ClickSign (contrato).

8. SLAs e Prazos

Aprovação de vaga: até 48h

Publicação: até 3 dias

Triagem + teste: até 10 dias

Entrevistas + decisão: até 5 dias

Processo total ideal: até 25 dias úteis

9. Fluxograma

Requisição de Vaga → Aprovação → Descrição + Divulgação → Triagem + Teste → Entrevistas (2–3) → Decisão → Oferta Enviada → Aceite? → Sim: SOP-RH-002 (Onboarding) → Fim / Não: Retomar triagem → Fim

10. Glossário

Case/teste prático: simulação de tarefa real da TBO para avaliar competência técnica.

Fit cultural: alinhamento do candidato com valores e forma de trabalhar da TBO.

PJ: Pessoa Jurídica — regime de contratação como prestador de serviço.

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Recrutamento e Seleção</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-RH-001</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Recursos Humanos (People)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Dir. Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Padronizar o processo de contratação para garantir alinhamento cultural, competência técnica e eficiência no tempo de preenchimento de vagas.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Abertura de vaga, descrição e divulgação, triagem com teste prático, entrevistas (2–3 etapas) e decisão de oferta.</p><p><strong>2.2 Exclusões</strong></p><p>Onboarding pós-contratação (SOP-RH-002), avaliação de performance (SOP-RH-003), contratação de freelancers pontuais (SOP-REL-001).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Triagem, entrevista cultural/técnica, decisão final</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>PO da BU</strong></p></td><td><p>Entrevista técnica e validação de fit para a área</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Entrevista final para cargos de liderança ou senioridade alta</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Logística de agenda, documentação, setup de contrato</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Requisição de vaga aprovada; faixa salarial validada; descrição de cargo; case de teste técnico preparado.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>LinkedIn (divulgação), Behance/GitHub (portfólio), Google Meet (entrevistas), ClickSign (contrato), TBO OS (registro).</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Abertura de Vaga</strong></p><p>Ação: PO preenche requisição no TBO OS: cargo, senioridade, regime (CLT/PJ), faixa salarial, justificativa. Marco valida necessidade e impacto financeiro. Acima de R$ 5.000/mês: aprovação conjunta.</p><p>Responsável: PO → Marco (→ Ruy)</p><p>Output: Vaga aprovada</p><p>Prazo referência: Até 48h</p><p><strong>5.2. Descrição e Divulgação</strong></p><p>Ação: Marco elabora descrição (responsabilidades, requisitos, diferenciais, benefícios). Divulgação em: LinkedIn, plataformas de nicho, indicação interna.</p><p>Responsável: Marco</p><p>Output: Vaga publicada</p><p>Prazo referência: Até 3 dias após aprovação</p><p><strong>5.3. Triagem e Teste Prático</strong></p><p>Ação: Marco faz triagem de portfólio/CV. Aprovados recebem case simulado do dia a dia TBO. Prazo de entrega: 5 dias úteis.</p><p>Responsável: Marco</p><p>Output: Candidatos pré-selecionados</p><p>Prazo referência: Até 10 dias após publicação</p><p><strong>5.4. Entrevistas e Decisão</strong></p><p>Ação: Etapa 1: fit cultural + técnica (Marco, 45 min). Etapa 2: validação com PO (30 min). Etapa 3: conversa com Ruy (liderança/sênior). Decisão registrada no TBO OS. Oferta enviada por e-mail.</p><p>Responsável: Marco + PO + Ruy</p><p>Output: Candidato selecionado e oferta enviada</p><p>Prazo referência: Até 5 dias após entrevistas</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Requisição preenchida e aprovada</li><li>[ ] Vaga publicada nos canais definidos</li><li>[ ] Triagem com teste prático realizada</li><li>[ ] Mínimo 2 entrevistas concluídas</li><li>[ ] Decisão registrada no TBO OS</li><li>[ ] Oferta enviada com condições claras</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Contratar sem teste prático → descobre incompatibilidade técnica tarde demais</li><li>Pular entrevista cultural → contratação desalinhada com valores TBO</li><li>Processo &gt; 30 dias → perde candidatos bons para concorrência</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS (requisição, registro), LinkedIn (divulgação), Behance/GitHub (portfólio), Google Meet (entrevistas), ClickSign (contrato).</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Aprovação de vaga: até 48h</li><li>Publicação: até 3 dias</li><li>Triagem + teste: até 10 dias</li><li>Entrevistas + decisão: até 5 dias</li><li>Processo total ideal: até 25 dias úteis</li></ul><p><strong>9. Fluxograma</strong></p><p>Requisição de Vaga → Aprovação → Descrição + Divulgação → Triagem + Teste → Entrevistas (2–3) → Decisão → Oferta Enviada → Aceite? → Sim: SOP-RH-002 (Onboarding) → Fim / Não: Retomar triagem → Fim</p><p><strong>10. Glossário</strong></p><p>Case/teste prático: simulação de tarefa real da TBO para avaliar competência técnica.</p><p>Fit cultural: alinhamento do candidato com valores e forma de trabalhar da TBO.</p><p>PJ: Pessoa Jurídica — regime de contratação como prestador de serviço.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['rh','pessoas','entrega','qualidade','aprovacao']::TEXT[],
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

  -- Steps for TBO-RH-001
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Padronizar o processo de contratação para garantir alinhamento cultural, competência técnica e eficiência no tempo de preenchimento de vagas.', '<p>Padronizar o processo de contratação para garantir alinhamento cultural, competência técnica e eficiência no tempo de preenchimento de vagas.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Abertura de vaga, descrição e divulgação, triagem com teste prático, entrevistas (2–3 etapas) e decisão de oferta.', '<p>Abertura de vaga, descrição e divulgação, triagem com teste prático, entrevistas (2–3 etapas) e decisão de oferta.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Onboarding pós-contratação (SOP-RH-002), avaliação de performance (SOP-RH-003), contratação de freelancers pontuais (SOP-REL-001).', '<p>Onboarding pós-contratação (SOP-RH-002), avaliação de performance (SOP-RH-003), contratação de freelancers pontuais (SOP-REL-001).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco

Triagem, entrevista cultural/técnica, decisão final

Executor

---

PO da BU

Entrevista técnica e validação de fit para a área

Consultor

---

Ruy

Entrevista final para cargos de liderança ou senioridade alta

Aprovador

---

Carol (Ops)

Logística de agenda, documentação, setup de contrato

Executor

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Triagem, entrevista cultural/técnica, decisão final</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>PO da BU</strong></p></td><td><p>Entrevista técnica e validação de fit para a área</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Entrevista final para cargos de liderança ou senioridade alta</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Logística de agenda, documentação, setup de contrato</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Requisição de vaga aprovada; faixa salarial validada; descrição de cargo; case de teste técnico preparado.', '<p>Requisição de vaga aprovada; faixa salarial validada; descrição de cargo; case de teste técnico preparado.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'LinkedIn (divulgação), Behance/GitHub (portfólio), Google Meet (entrevistas), ClickSign (contrato), TBO OS (registro).', '<p>LinkedIn (divulgação), Behance/GitHub (portfólio), Google Meet (entrevistas), ClickSign (contrato), TBO OS (registro).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Abertura de Vaga', 'Ação: PO preenche requisição no TBO OS: cargo, senioridade, regime (CLT/PJ), faixa salarial, justificativa. Marco valida necessidade e impacto financeiro. Acima de R$ 5.000/mês: aprovação conjunta.

Responsável: PO → Marco (→ Ruy)

Output: Vaga aprovada

Prazo referência: Até 48h', '<p>Ação: PO preenche requisição no TBO OS: cargo, senioridade, regime (CLT/PJ), faixa salarial, justificativa. Marco valida necessidade e impacto financeiro. Acima de R$ 5.000/mês: aprovação conjunta.</p><p>Responsável: PO → Marco (→ Ruy)</p><p>Output: Vaga aprovada</p><p>Prazo referência: Até 48h</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Descrição e Divulgação', 'Ação: Marco elabora descrição (responsabilidades, requisitos, diferenciais, benefícios). Divulgação em: LinkedIn, plataformas de nicho, indicação interna.

Responsável: Marco

Output: Vaga publicada

Prazo referência: Até 3 dias após aprovação', '<p>Ação: Marco elabora descrição (responsabilidades, requisitos, diferenciais, benefícios). Divulgação em: LinkedIn, plataformas de nicho, indicação interna.</p><p>Responsável: Marco</p><p>Output: Vaga publicada</p><p>Prazo referência: Até 3 dias após aprovação</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Triagem e Teste Prático', 'Ação: Marco faz triagem de portfólio/CV. Aprovados recebem case simulado do dia a dia TBO. Prazo de entrega: 5 dias úteis.

Responsável: Marco

Output: Candidatos pré-selecionados

Prazo referência: Até 10 dias após publicação', '<p>Ação: Marco faz triagem de portfólio/CV. Aprovados recebem case simulado do dia a dia TBO. Prazo de entrega: 5 dias úteis.</p><p>Responsável: Marco</p><p>Output: Candidatos pré-selecionados</p><p>Prazo referência: Até 10 dias após publicação</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Entrevistas e Decisão', 'Ação: Etapa 1: fit cultural + técnica (Marco, 45 min). Etapa 2: validação com PO (30 min). Etapa 3: conversa com Ruy (liderança/sênior). Decisão registrada no TBO OS. Oferta enviada por e-mail.

Responsável: Marco + PO + Ruy

Output: Candidato selecionado e oferta enviada

Prazo referência: Até 5 dias após entrevistas', '<p>Ação: Etapa 1: fit cultural + técnica (Marco, 45 min). Etapa 2: validação com PO (30 min). Etapa 3: conversa com Ruy (liderança/sênior). Decisão registrada no TBO OS. Oferta enviada por e-mail.</p><p>Responsável: Marco + PO + Ruy</p><p>Output: Candidato selecionado e oferta enviada</p><p>Prazo referência: Até 5 dias após entrevistas</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Requisição preenchida e aprovada

[ ] Vaga publicada nos canais definidos

[ ] Triagem com teste prático realizada

[ ] Mínimo 2 entrevistas concluídas

[ ] Decisão registrada no TBO OS

[ ] Oferta enviada com condições claras', '<ul><li>[ ] Requisição preenchida e aprovada</li><li>[ ] Vaga publicada nos canais definidos</li><li>[ ] Triagem com teste prático realizada</li><li>[ ] Mínimo 2 entrevistas concluídas</li><li>[ ] Decisão registrada no TBO OS</li><li>[ ] Oferta enviada com condições claras</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Contratar sem teste prático → descobre incompatibilidade técnica tarde demais

Pular entrevista cultural → contratação desalinhada com valores TBO

Processo > 30 dias → perde candidatos bons para concorrência', '<ul><li>Contratar sem teste prático → descobre incompatibilidade técnica tarde demais</li><li>Pular entrevista cultural → contratação desalinhada com valores TBO</li><li>Processo &gt; 30 dias → perde candidatos bons para concorrência</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (requisição, registro), LinkedIn (divulgação), Behance/GitHub (portfólio), Google Meet (entrevistas), ClickSign (contrato).', '<p>TBO OS (requisição, registro), LinkedIn (divulgação), Behance/GitHub (portfólio), Google Meet (entrevistas), ClickSign (contrato).</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Aprovação de vaga: até 48h

Publicação: até 3 dias

Triagem + teste: até 10 dias

Entrevistas + decisão: até 5 dias

Processo total ideal: até 25 dias úteis', '<ul><li>Aprovação de vaga: até 48h</li><li>Publicação: até 3 dias</li><li>Triagem + teste: até 10 dias</li><li>Entrevistas + decisão: até 5 dias</li><li>Processo total ideal: até 25 dias úteis</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Requisição de Vaga → Aprovação → Descrição + Divulgação → Triagem + Teste → Entrevistas (2–3) → Decisão → Oferta Enviada → Aceite? → Sim: SOP-RH-002 (Onboarding) → Fim / Não: Retomar triagem → Fim', '<p>Requisição de Vaga → Aprovação → Descrição + Divulgação → Triagem + Teste → Entrevistas (2–3) → Decisão → Oferta Enviada → Aceite? → Sim: SOP-RH-002 (Onboarding) → Fim / Não: Retomar triagem → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Case/teste prático: simulação de tarefa real da TBO para avaliar competência técnica.

Fit cultural: alinhamento do candidato com valores e forma de trabalhar da TBO.

PJ: Pessoa Jurídica — regime de contratação como prestador de serviço.', '<p>Case/teste prático: simulação de tarefa real da TBO para avaliar competência técnica.</p><p>Fit cultural: alinhamento do candidato com valores e forma de trabalhar da TBO.</p><p>PJ: Pessoa Jurídica — regime de contratação como prestador de serviço.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-RH-002: Onboarding de Colaborador ──
END $$;