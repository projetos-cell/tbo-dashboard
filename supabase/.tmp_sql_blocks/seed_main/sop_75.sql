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
    'Codigo de Conduta e Etica',
    'tbo-pol-001-codigo-de-conduta-e-etica',
    'politicas',
    'checklist',
    'Marco Andolfato (Dir. Operações)',
    'Standard Operating Procedure

Código de Conduta e Ética

Código

TBO-POL-001

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

Estabelecer diretrizes de conduta que orientam o comportamento de todos os membros da TBO — sócios, colaboradores, freelancers e parceiros — no relacionamento interno, com clientes e com o mercado.

2. Escopo

2.1 O que está coberto

Princípios éticos, condutas esperadas, condutas inaceitáveis, canal de relato e consequências.

2.2 Exclusões

Políticas de segurança da informação (SOP-POL-002), propriedade intelectual (SOP-POL-003), gestão de contratos (SOP-POL-004).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco

Definir, comunicar e fazer cumprir o código

Executor

---

Ruy

Aprovar e fazer cumprir

Aprovador

---

Todos os membros

Seguir o código, reportar violações

Executor

---



4. Pré-requisitos

4.1 Inputs necessários

Valores da TBO definidos; processos de onboarding atualizados para incluir o código.

4.2 Ferramentas e Acessos

TBO OS, Google Drive (documento do código), ClickSign (aceite formal).

5. Procedimento Passo a Passo

5.1. Definição e Documentação

Ação: Marco documenta os princípios (integridade, excelência, respeito, responsabilidade, confidencialidade), condutas esperadas e condutas inaceitáveis. Aprovação de Ruy.

Responsável: Marco

Output: Código de conduta documentado

Prazo referência: Versão inicial + revisão anual

5.2. Comunicação e Aceite

Ação: Todo novo membro recebe o código no onboarding (SOP-RH-002) e assina aceite via ClickSign. Membros atuais assinam na primeira versão e em revisões significativas.

Responsável: Carol (Ops)

Output: Aceite assinado por todos

Prazo referência: No onboarding ou na revisão

5.3. Relato de Violações

Ação: Qualquer violação pode ser reportada diretamente a Marco ou Ruy de forma confidencial. Relatos são tratados com sigilo e investigados em até 10 dias úteis.

Responsável: Marco + Ruy

Output: Investigação concluída

Prazo referência: Até 10 dias úteis

5.4. Consequências

Ação: Conforme gravidade: advertência verbal, advertência formal registrada, suspensão de projetos, desligamento. Decisão conjunta dos sócios.

Responsável: Marco + Ruy

Output: Medida aplicada e registrada

Prazo referência: Conforme gravidade

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Código documentado e aprovado

[ ] Aceite assinado por todos os membros

[ ] Canal de relato conhecido por todos

[ ] Investigações concluídas dentro do prazo

6.2 Erros Comuns a Evitar

Código apenas no papel → cultura não muda, apenas gera compliance fake

Não investigar relatos → perda de credibilidade do canal

Punição desproporcional → clima organizacional deteriora

7. Ferramentas e Templates

TBO OS, Google Drive, ClickSign.

8. SLAs e Prazos

Aceite: no onboarding

Investigação: até 10 dias úteis

Revisão do código: anual

9. Fluxograma

Código Documentado → Comunicação ao Time → Aceite Formal (ClickSign) → Violação Reportada? → Sim: Investigação (10 dias) → Medida Aplicada → Registro → Fim / Não: Revisão Anual → Fim

10. Glossário

Compliance: conformidade com regras, políticas e legislação aplicável.

Canal de relato: meio confidencial para reportar violações do código.

Advertência formal: registro documentado de violação com plano de correção.

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Código de Conduta e Ética</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-POL-001</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Políticas (Compliance)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Dir. Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Estabelecer diretrizes de conduta que orientam o comportamento de todos os membros da TBO — sócios, colaboradores, freelancers e parceiros — no relacionamento interno, com clientes e com o mercado.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Princípios éticos, condutas esperadas, condutas inaceitáveis, canal de relato e consequências.</p><p><strong>2.2 Exclusões</strong></p><p>Políticas de segurança da informação (SOP-POL-002), propriedade intelectual (SOP-POL-003), gestão de contratos (SOP-POL-004).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Definir, comunicar e fazer cumprir o código</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Aprovar e fazer cumprir</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Todos os membros</strong></p></td><td><p>Seguir o código, reportar violações</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Valores da TBO definidos; processos de onboarding atualizados para incluir o código.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>TBO OS, Google Drive (documento do código), ClickSign (aceite formal).</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Definição e Documentação</strong></p><p>Ação: Marco documenta os princípios (integridade, excelência, respeito, responsabilidade, confidencialidade), condutas esperadas e condutas inaceitáveis. Aprovação de Ruy.</p><p>Responsável: Marco</p><p>Output: Código de conduta documentado</p><p>Prazo referência: Versão inicial + revisão anual</p><p><strong>5.2. Comunicação e Aceite</strong></p><p>Ação: Todo novo membro recebe o código no onboarding (SOP-RH-002) e assina aceite via ClickSign. Membros atuais assinam na primeira versão e em revisões significativas.</p><p>Responsável: Carol (Ops)</p><p>Output: Aceite assinado por todos</p><p>Prazo referência: No onboarding ou na revisão</p><p><strong>5.3. Relato de Violações</strong></p><p>Ação: Qualquer violação pode ser reportada diretamente a Marco ou Ruy de forma confidencial. Relatos são tratados com sigilo e investigados em até 10 dias úteis.</p><p>Responsável: Marco + Ruy</p><p>Output: Investigação concluída</p><p>Prazo referência: Até 10 dias úteis</p><p><strong>5.4. Consequências</strong></p><p>Ação: Conforme gravidade: advertência verbal, advertência formal registrada, suspensão de projetos, desligamento. Decisão conjunta dos sócios.</p><p>Responsável: Marco + Ruy</p><p>Output: Medida aplicada e registrada</p><p>Prazo referência: Conforme gravidade</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Código documentado e aprovado</li><li>[ ] Aceite assinado por todos os membros</li><li>[ ] Canal de relato conhecido por todos</li><li>[ ] Investigações concluídas dentro do prazo</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Código apenas no papel → cultura não muda, apenas gera compliance fake</li><li>Não investigar relatos → perda de credibilidade do canal</li><li>Punição desproporcional → clima organizacional deteriora</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS, Google Drive, ClickSign.</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Aceite: no onboarding</li><li>Investigação: até 10 dias úteis</li><li>Revisão do código: anual</li></ul><p><strong>9. Fluxograma</strong></p><p>Código Documentado → Comunicação ao Time → Aceite Formal (ClickSign) → Violação Reportada? → Sim: Investigação (10 dias) → Medida Aplicada → Registro → Fim / Não: Revisão Anual → Fim</p><p><strong>10. Glossário</strong></p><p>Compliance: conformidade com regras, políticas e legislação aplicável.</p><p>Canal de relato: meio confidencial para reportar violações do código.</p><p>Advertência formal: registro documentado de violação com plano de correção.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['politica','compliance','entrega','qualidade','cliente','aprovacao']::TEXT[],
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

  -- Steps for TBO-POL-001
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Estabelecer diretrizes de conduta que orientam o comportamento de todos os membros da TBO — sócios, colaboradores, freelancers e parceiros — no relacionamento interno, com clientes e com o mercado.', '<p>Estabelecer diretrizes de conduta que orientam o comportamento de todos os membros da TBO — sócios, colaboradores, freelancers e parceiros — no relacionamento interno, com clientes e com o mercado.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Princípios éticos, condutas esperadas, condutas inaceitáveis, canal de relato e consequências.', '<p>Princípios éticos, condutas esperadas, condutas inaceitáveis, canal de relato e consequências.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Políticas de segurança da informação (SOP-POL-002), propriedade intelectual (SOP-POL-003), gestão de contratos (SOP-POL-004).', '<p>Políticas de segurança da informação (SOP-POL-002), propriedade intelectual (SOP-POL-003), gestão de contratos (SOP-POL-004).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco

Definir, comunicar e fazer cumprir o código

Executor

---

Ruy

Aprovar e fazer cumprir

Aprovador

---

Todos os membros

Seguir o código, reportar violações

Executor

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Definir, comunicar e fazer cumprir o código</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Aprovar e fazer cumprir</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Todos os membros</strong></p></td><td><p>Seguir o código, reportar violações</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Valores da TBO definidos; processos de onboarding atualizados para incluir o código.', '<p>Valores da TBO definidos; processos de onboarding atualizados para incluir o código.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS, Google Drive (documento do código), ClickSign (aceite formal).', '<p>TBO OS, Google Drive (documento do código), ClickSign (aceite formal).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Definição e Documentação', 'Ação: Marco documenta os princípios (integridade, excelência, respeito, responsabilidade, confidencialidade), condutas esperadas e condutas inaceitáveis. Aprovação de Ruy.

Responsável: Marco

Output: Código de conduta documentado

Prazo referência: Versão inicial + revisão anual', '<p>Ação: Marco documenta os princípios (integridade, excelência, respeito, responsabilidade, confidencialidade), condutas esperadas e condutas inaceitáveis. Aprovação de Ruy.</p><p>Responsável: Marco</p><p>Output: Código de conduta documentado</p><p>Prazo referência: Versão inicial + revisão anual</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Comunicação e Aceite', 'Ação: Todo novo membro recebe o código no onboarding (SOP-RH-002) e assina aceite via ClickSign. Membros atuais assinam na primeira versão e em revisões significativas.

Responsável: Carol (Ops)

Output: Aceite assinado por todos

Prazo referência: No onboarding ou na revisão', '<p>Ação: Todo novo membro recebe o código no onboarding (SOP-RH-002) e assina aceite via ClickSign. Membros atuais assinam na primeira versão e em revisões significativas.</p><p>Responsável: Carol (Ops)</p><p>Output: Aceite assinado por todos</p><p>Prazo referência: No onboarding ou na revisão</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Relato de Violações', 'Ação: Qualquer violação pode ser reportada diretamente a Marco ou Ruy de forma confidencial. Relatos são tratados com sigilo e investigados em até 10 dias úteis.

Responsável: Marco + Ruy

Output: Investigação concluída

Prazo referência: Até 10 dias úteis', '<p>Ação: Qualquer violação pode ser reportada diretamente a Marco ou Ruy de forma confidencial. Relatos são tratados com sigilo e investigados em até 10 dias úteis.</p><p>Responsável: Marco + Ruy</p><p>Output: Investigação concluída</p><p>Prazo referência: Até 10 dias úteis</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Consequências', 'Ação: Conforme gravidade: advertência verbal, advertência formal registrada, suspensão de projetos, desligamento. Decisão conjunta dos sócios.

Responsável: Marco + Ruy

Output: Medida aplicada e registrada

Prazo referência: Conforme gravidade', '<p>Ação: Conforme gravidade: advertência verbal, advertência formal registrada, suspensão de projetos, desligamento. Decisão conjunta dos sócios.</p><p>Responsável: Marco + Ruy</p><p>Output: Medida aplicada e registrada</p><p>Prazo referência: Conforme gravidade</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Código documentado e aprovado

[ ] Aceite assinado por todos os membros

[ ] Canal de relato conhecido por todos

[ ] Investigações concluídas dentro do prazo', '<ul><li>[ ] Código documentado e aprovado</li><li>[ ] Aceite assinado por todos os membros</li><li>[ ] Canal de relato conhecido por todos</li><li>[ ] Investigações concluídas dentro do prazo</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Código apenas no papel → cultura não muda, apenas gera compliance fake

Não investigar relatos → perda de credibilidade do canal

Punição desproporcional → clima organizacional deteriora', '<ul><li>Código apenas no papel → cultura não muda, apenas gera compliance fake</li><li>Não investigar relatos → perda de credibilidade do canal</li><li>Punição desproporcional → clima organizacional deteriora</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS, Google Drive, ClickSign.', '<p>TBO OS, Google Drive, ClickSign.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Aceite: no onboarding

Investigação: até 10 dias úteis

Revisão do código: anual', '<ul><li>Aceite: no onboarding</li><li>Investigação: até 10 dias úteis</li><li>Revisão do código: anual</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Código Documentado → Comunicação ao Time → Aceite Formal (ClickSign) → Violação Reportada? → Sim: Investigação (10 dias) → Medida Aplicada → Registro → Fim / Não: Revisão Anual → Fim', '<p>Código Documentado → Comunicação ao Time → Aceite Formal (ClickSign) → Violação Reportada? → Sim: Investigação (10 dias) → Medida Aplicada → Registro → Fim / Não: Revisão Anual → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Compliance: conformidade com regras, políticas e legislação aplicável.

Canal de relato: meio confidencial para reportar violações do código.

Advertência formal: registro documentado de violação com plano de correção.', '<p>Compliance: conformidade com regras, políticas e legislação aplicável.</p><p>Canal de relato: meio confidencial para reportar violações do código.</p><p>Advertência formal: registro documentado de violação com plano de correção.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-POL-002: Seguranca da Informacao ──
END $$;