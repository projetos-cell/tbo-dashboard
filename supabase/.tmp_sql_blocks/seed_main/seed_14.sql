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
    'Contas a Pagar e Controle de Despesas',
    'tbo-fin-002-contas-a-pagar-e-controle-de-despesas',
    'financeiro',
    'checklist',
    'Contas a Pagar e Controle de Despesas',
    'Standard Operating Procedure

Contas a Pagar e Controle de Despesas

Código

TBO-FIN-002

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Financeiro (Controladoria)

Responsável

Marco Andolfato (Dir. Operações)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Controlar todas as saídas financeiras da TBO com rastreabilidade por centro de custo, aprovação prévia e registro no sistema, garantindo disciplina de caixa.

2. Escopo

2.1 O que está coberto

Solicitação de pagamento, classificação por centro de custo (Infraestrutura, Financeiro, Projetos, Passivo de Giro, Pessoas), janela de pagamento, controle de cartão corporativo BB.

2.2 Exclusões

Faturamento de clientes (SOP-FIN-001), fluxo de caixa projetado (SOP-FIN-003), folha de pagamento e encargos CLT (contabilidade externa).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Registrar despesas e solicitar pagamentos

Executor

---

Marco

Aprovar despesas, executar pagamentos, conciliar cartão

Aprovador

---

Ruy

Co-aprovar despesas acima de R$ 5.000

Aprovador

---



4. Pré-requisitos

4.1 Inputs necessários

Omie ERP configurado com centros de custo; extrato do Cartão BB Empresarial; lista de despesas recorrentes; alçadas de aprovação definidas.

4.2 Ferramentas e Acessos

Omie ERP, TBO OS (módulo financeiro), BB Empresarial, Google Drive (comprovantes).

5. Procedimento Passo a Passo

5.1. Solicitação de Pagamento

Ação: Qualquer despesa não recorrente acima de R$ 500 requer solicitação prévia no TBO OS com justificativa, centro de custo e valor. Marco aprova até R$ 5.000; acima, aprovação conjunta.

Responsável: Solicitante → Marco (→ Ruy se > R$ 5k)

Output: Despesa aprovada ou rejeitada

Prazo referência: Até 24h para aprovação

5.2. Registro e Classificação

Ação: Toda despesa registrada no Omie com: data, fornecedor, centro de custo, projeto vinculado (quando aplicável), comprovante anexo.

Responsável: Carol (Ops)

Output: Despesa registrada e classificada

Prazo referência: Até 48h após pagamento

5.3. Janela de Pagamento

Ação: Pagamentos executados às terças e quintas. Marco valida a lista de pagamentos do dia antes da execução bancária.

Responsável: Marco

Output: Pagamentos executados

Prazo referência: Terças e quintas

5.4. Conciliação do Cartão Corporativo

Ação: Fatura do Cartão BB Empresarial conciliada mensalmente. Cada lançamento classificado por centro de custo. Gastos sem classificação são bloqueados para o mês seguinte.

Responsável: Marco

Output: Fatura conciliada e classificada

Prazo referência: Até dia 10 de cada mês

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Toda despesa com comprovante e centro de custo

[ ] Despesas acima de R$ 500 com aprovação prévia

[ ] Pagamentos executados na janela (terças/quintas)

[ ] Cartão corporativo conciliado mensalmente

[ ] Nenhum gasto sem classificação pendente

6.2 Erros Comuns a Evitar

Pagar sem aprovação → perda de controle financeiro

Despesa sem centro de custo → impossível analisar rentabilidade

Não conciliar cartão → surpresas na fatura e descontrole

7. Ferramentas e Templates

Omie ERP, TBO OS (financeiro), BB Empresarial, Google Drive (comprovantes).

8. SLAs e Prazos

Aprovação de despesa: até 24h

Registro no Omie: até 48h após pagamento

Janela de pagamento: terças e quintas

Conciliação do cartão: até dia 10 de cada mês

9. Fluxograma

Despesa Identificada → Recorrente? → Sim: Registro direto → Não: Solicitação no TBO OS → Aprovação (Marco / Marco+Ruy) → Janela de Pagamento → Registro no Omie → Conciliação → Fim

10. Glossário

Centro de custo: categoria que agrupa despesas por natureza (Infraestrutura, Projetos, Pessoas, etc.).

Janela de pagamento: dias específicos da semana em que pagamentos são processados.

Alçada: limite de valor até o qual uma pessoa pode aprovar despesas autonomamente.

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Contas a Pagar e Controle de Despesas</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-FIN-002</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Financeiro (Controladoria)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Dir. Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Controlar todas as saídas financeiras da TBO com rastreabilidade por centro de custo, aprovação prévia e registro no sistema, garantindo disciplina de caixa.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Solicitação de pagamento, classificação por centro de custo (Infraestrutura, Financeiro, Projetos, Passivo de Giro, Pessoas), janela de pagamento, controle de cartão corporativo BB.</p><p><strong>2.2 Exclusões</strong></p><p>Faturamento de clientes (SOP-FIN-001), fluxo de caixa projetado (SOP-FIN-003), folha de pagamento e encargos CLT (contabilidade externa).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Registrar despesas e solicitar pagamentos</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Aprovar despesas, executar pagamentos, conciliar cartão</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Co-aprovar despesas acima de R$ 5.000</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Omie ERP configurado com centros de custo; extrato do Cartão BB Empresarial; lista de despesas recorrentes; alçadas de aprovação definidas.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Omie ERP, TBO OS (módulo financeiro), BB Empresarial, Google Drive (comprovantes).</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Solicitação de Pagamento</strong></p><p>Ação: Qualquer despesa não recorrente acima de R$ 500 requer solicitação prévia no TBO OS com justificativa, centro de custo e valor. Marco aprova até R$ 5.000; acima, aprovação conjunta.</p><p>Responsável: Solicitante → Marco (→ Ruy se &gt; R$ 5k)</p><p>Output: Despesa aprovada ou rejeitada</p><p>Prazo referência: Até 24h para aprovação</p><p><strong>5.2. Registro e Classificação</strong></p><p>Ação: Toda despesa registrada no Omie com: data, fornecedor, centro de custo, projeto vinculado (quando aplicável), comprovante anexo.</p><p>Responsável: Carol (Ops)</p><p>Output: Despesa registrada e classificada</p><p>Prazo referência: Até 48h após pagamento</p><p><strong>5.3. Janela de Pagamento</strong></p><p>Ação: Pagamentos executados às terças e quintas. Marco valida a lista de pagamentos do dia antes da execução bancária.</p><p>Responsável: Marco</p><p>Output: Pagamentos executados</p><p>Prazo referência: Terças e quintas</p><p><strong>5.4. Conciliação do Cartão Corporativo</strong></p><p>Ação: Fatura do Cartão BB Empresarial conciliada mensalmente. Cada lançamento classificado por centro de custo. Gastos sem classificação são bloqueados para o mês seguinte.</p><p>Responsável: Marco</p><p>Output: Fatura conciliada e classificada</p><p>Prazo referência: Até dia 10 de cada mês</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Toda despesa com comprovante e centro de custo</li><li>[ ] Despesas acima de R$ 500 com aprovação prévia</li><li>[ ] Pagamentos executados na janela (terças/quintas)</li><li>[ ] Cartão corporativo conciliado mensalmente</li><li>[ ] Nenhum gasto sem classificação pendente</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Pagar sem aprovação → perda de controle financeiro</li><li>Despesa sem centro de custo → impossível analisar rentabilidade</li><li>Não conciliar cartão → surpresas na fatura e descontrole</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>Omie ERP, TBO OS (financeiro), BB Empresarial, Google Drive (comprovantes).</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Aprovação de despesa: até 24h</li><li>Registro no Omie: até 48h após pagamento</li><li>Janela de pagamento: terças e quintas</li><li>Conciliação do cartão: até dia 10 de cada mês</li></ul><p><strong>9. Fluxograma</strong></p><p>Despesa Identificada → Recorrente? → Sim: Registro direto → Não: Solicitação no TBO OS → Aprovação (Marco / Marco+Ruy) → Janela de Pagamento → Registro no Omie → Conciliação → Fim</p><p><strong>10. Glossário</strong></p><p>Centro de custo: categoria que agrupa despesas por natureza (Infraestrutura, Projetos, Pessoas, etc.).</p><p>Janela de pagamento: dias específicos da semana em que pagamentos são processados.</p><p>Alçada: limite de valor até o qual uma pessoa pode aprovar despesas autonomamente.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'high',
    ARRAY['financeiro','fiscal','entrega','qualidade','cliente','aprovacao']::TEXT[],
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

  -- Steps for TBO-FIN-002
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Controlar todas as saídas financeiras da TBO com rastreabilidade por centro de custo, aprovação prévia e registro no sistema, garantindo disciplina de caixa.', '<p>Controlar todas as saídas financeiras da TBO com rastreabilidade por centro de custo, aprovação prévia e registro no sistema, garantindo disciplina de caixa.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Solicitação de pagamento, classificação por centro de custo (Infraestrutura, Financeiro, Projetos, Passivo de Giro, Pessoas), janela de pagamento, controle de cartão corporativo BB.', '<p>Solicitação de pagamento, classificação por centro de custo (Infraestrutura, Financeiro, Projetos, Passivo de Giro, Pessoas), janela de pagamento, controle de cartão corporativo BB.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Faturamento de clientes (SOP-FIN-001), fluxo de caixa projetado (SOP-FIN-003), folha de pagamento e encargos CLT (contabilidade externa).', '<p>Faturamento de clientes (SOP-FIN-001), fluxo de caixa projetado (SOP-FIN-003), folha de pagamento e encargos CLT (contabilidade externa).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Registrar despesas e solicitar pagamentos

Executor

---

Marco

Aprovar despesas, executar pagamentos, conciliar cartão

Aprovador

---

Ruy

Co-aprovar despesas acima de R$ 5.000

Aprovador

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Registrar despesas e solicitar pagamentos</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Aprovar despesas, executar pagamentos, conciliar cartão</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Co-aprovar despesas acima de R$ 5.000</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Omie ERP configurado com centros de custo; extrato do Cartão BB Empresarial; lista de despesas recorrentes; alçadas de aprovação definidas.', '<p>Omie ERP configurado com centros de custo; extrato do Cartão BB Empresarial; lista de despesas recorrentes; alçadas de aprovação definidas.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Omie ERP, TBO OS (módulo financeiro), BB Empresarial, Google Drive (comprovantes).', '<p>Omie ERP, TBO OS (módulo financeiro), BB Empresarial, Google Drive (comprovantes).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Solicitação de Pagamento', 'Ação: Qualquer despesa não recorrente acima de R$ 500 requer solicitação prévia no TBO OS com justificativa, centro de custo e valor. Marco aprova até R$ 5.000; acima, aprovação conjunta.

Responsável: Solicitante → Marco (→ Ruy se > R$ 5k)

Output: Despesa aprovada ou rejeitada

Prazo referência: Até 24h para aprovação', '<p>Ação: Qualquer despesa não recorrente acima de R$ 500 requer solicitação prévia no TBO OS com justificativa, centro de custo e valor. Marco aprova até R$ 5.000; acima, aprovação conjunta.</p><p>Responsável: Solicitante → Marco (→ Ruy se &gt; R$ 5k)</p><p>Output: Despesa aprovada ou rejeitada</p><p>Prazo referência: Até 24h para aprovação</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Registro e Classificação', 'Ação: Toda despesa registrada no Omie com: data, fornecedor, centro de custo, projeto vinculado (quando aplicável), comprovante anexo.

Responsável: Carol (Ops)

Output: Despesa registrada e classificada

Prazo referência: Até 48h após pagamento', '<p>Ação: Toda despesa registrada no Omie com: data, fornecedor, centro de custo, projeto vinculado (quando aplicável), comprovante anexo.</p><p>Responsável: Carol (Ops)</p><p>Output: Despesa registrada e classificada</p><p>Prazo referência: Até 48h após pagamento</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Janela de Pagamento', 'Ação: Pagamentos executados às terças e quintas. Marco valida a lista de pagamentos do dia antes da execução bancária.

Responsável: Marco

Output: Pagamentos executados

Prazo referência: Terças e quintas', '<p>Ação: Pagamentos executados às terças e quintas. Marco valida a lista de pagamentos do dia antes da execução bancária.</p><p>Responsável: Marco</p><p>Output: Pagamentos executados</p><p>Prazo referência: Terças e quintas</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Conciliação do Cartão Corporativo', 'Ação: Fatura do Cartão BB Empresarial conciliada mensalmente. Cada lançamento classificado por centro de custo. Gastos sem classificação são bloqueados para o mês seguinte.

Responsável: Marco

Output: Fatura conciliada e classificada

Prazo referência: Até dia 10 de cada mês', '<p>Ação: Fatura do Cartão BB Empresarial conciliada mensalmente. Cada lançamento classificado por centro de custo. Gastos sem classificação são bloqueados para o mês seguinte.</p><p>Responsável: Marco</p><p>Output: Fatura conciliada e classificada</p><p>Prazo referência: Até dia 10 de cada mês</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Toda despesa com comprovante e centro de custo

[ ] Despesas acima de R$ 500 com aprovação prévia

[ ] Pagamentos executados na janela (terças/quintas)

[ ] Cartão corporativo conciliado mensalmente

[ ] Nenhum gasto sem classificação pendente', '<ul><li>[ ] Toda despesa com comprovante e centro de custo</li><li>[ ] Despesas acima de R$ 500 com aprovação prévia</li><li>[ ] Pagamentos executados na janela (terças/quintas)</li><li>[ ] Cartão corporativo conciliado mensalmente</li><li>[ ] Nenhum gasto sem classificação pendente</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Pagar sem aprovação → perda de controle financeiro

Despesa sem centro de custo → impossível analisar rentabilidade

Não conciliar cartão → surpresas na fatura e descontrole', '<ul><li>Pagar sem aprovação → perda de controle financeiro</li><li>Despesa sem centro de custo → impossível analisar rentabilidade</li><li>Não conciliar cartão → surpresas na fatura e descontrole</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Omie ERP, TBO OS (financeiro), BB Empresarial, Google Drive (comprovantes).', '<p>Omie ERP, TBO OS (financeiro), BB Empresarial, Google Drive (comprovantes).</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Aprovação de despesa: até 24h

Registro no Omie: até 48h após pagamento

Janela de pagamento: terças e quintas

Conciliação do cartão: até dia 10 de cada mês', '<ul><li>Aprovação de despesa: até 24h</li><li>Registro no Omie: até 48h após pagamento</li><li>Janela de pagamento: terças e quintas</li><li>Conciliação do cartão: até dia 10 de cada mês</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Despesa Identificada → Recorrente? → Sim: Registro direto → Não: Solicitação no TBO OS → Aprovação (Marco / Marco+Ruy) → Janela de Pagamento → Registro no Omie → Conciliação → Fim', '<p>Despesa Identificada → Recorrente? → Sim: Registro direto → Não: Solicitação no TBO OS → Aprovação (Marco / Marco+Ruy) → Janela de Pagamento → Registro no Omie → Conciliação → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Centro de custo: categoria que agrupa despesas por natureza (Infraestrutura, Projetos, Pessoas, etc.).

Janela de pagamento: dias específicos da semana em que pagamentos são processados.

Alçada: limite de valor até o qual uma pessoa pode aprovar despesas autonomamente.', '<p>Centro de custo: categoria que agrupa despesas por natureza (Infraestrutura, Projetos, Pessoas, etc.).</p><p>Janela de pagamento: dias específicos da semana em que pagamentos são processados.</p><p>Alçada: limite de valor até o qual uma pessoa pode aprovar despesas autonomamente.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-FIN-003: Fluxo de Caixa e DRE Mensal ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Fluxo de Caixa e DRE Mensal',
    'tbo-fin-003-fluxo-de-caixa-e-dre-mensal',
    'financeiro',
    'checklist',
    'Marco Andolfato (Dir. Operações)',
    'Standard Operating Procedure

Fluxo de Caixa e DRE Mensal

Código

TBO-FIN-003

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Financeiro (Controladoria)

Responsável

Marco Andolfato (Dir. Operações)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Manter visibilidade constante da saúde financeira da TBO através de fluxo de caixa projetado para 90 dias e DRE mensal, permitindo decisões informadas sobre investimentos, contratações e operação.

2. Escopo

2.1 O que está coberto

Projeção semanal de fluxo de caixa, DRE mensal consolidada, reunião financeira mensal entre sócios e plano de contingência para caixa negativo.

2.2 Exclusões

Contas a receber (SOP-FIN-001), contas a pagar (SOP-FIN-002), forecast comercial (SOP-COM-004), planejamento tributário (contabilidade externa).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco

Atualizar fluxo de caixa, consolidar DRE, acionar contingência

Executor

---

Ruy

Revisar DRE e participar de decisões estratégicas

Aprovador

---



4. Pré-requisitos

4.1 Inputs necessários

Contas a receber atualizadas; contas a pagar registradas; pipeline comercial ponderado (SOP-COM-004); extrato bancário atualizado.

4.2 Ferramentas e Acessos

TBO OS (módulo financeiro), Omie ERP, Google Sheets (fluxo de caixa), BB Empresarial.

5. Procedimento Passo a Passo

5.1. Fluxo de Caixa Projetado (semanal)

Ação: Marco atualiza semanalmente a projeção para 90 dias, cruzando contas a receber (contratos + pipeline ponderado) com contas a pagar (fixas + variáveis previstas).

Responsável: Marco

Output: Fluxo de caixa atualizado

Prazo referência: Toda sexta-feira

5.2. DRE Mensal

Ação: Até dia 10, Marco consolida a DRE do mês anterior: Receita Bruta → Impostos → Receita Líquida → Custos de Produção → Margem Bruta → Despesas Operacionais → EBITDA.

Responsável: Marco

Output: DRE mensal consolidada

Prazo referência: Até dia 10 de cada mês

5.3. Reunião Financeira Mensal

Ação: Marco e Ruy revisam DRE e fluxo de caixa até dia 15. Decisões sobre investimentos, contratações ou cortes são registradas em ata no TBO OS.

Responsável: Marco + Ruy

Output: Ata com decisões financeiras registrada

Prazo referência: Até dia 15 de cada mês

5.4. Plano de Contingência

Ação: Se o fluxo projetado para 30 dias indicar saldo negativo, Marco aciona imediatamente: antecipação de recebíveis, renegociação de prazos com fornecedores, contenção de despesas variáveis.

Responsável: Marco

Output: Plano de contingência ativado

Prazo referência: Imediato quando detectado

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Fluxo de caixa atualizado semanalmente

[ ] DRE mensal consolidada até dia 10

[ ] Reunião financeira mensal realizada até dia 15

[ ] Plano de contingência acionado quando necessário

6.2 Erros Comuns a Evitar

Não projetar fluxo de caixa → surpresas de caixa negativo sem tempo de reação

DRE atrasada → decisões baseadas em feeling, não em dados

Ignorar saldo negativo projetado → crise de liquidez evitável

7. Ferramentas e Templates

TBO OS (financeiro), Omie ERP (dados contábeis), Google Sheets (projeções), BB Empresarial (extrato).

8. SLAs e Prazos

Fluxo de caixa: atualização semanal (sexta)

DRE: até dia 10

Reunião financeira: até dia 15

Contingência: imediato se projeção 30d for negativa

9. Fluxograma

Sexta: Atualizar Fluxo de Caixa → Projeção 30d negativa? → Sim: Acionar Contingência → Dia 10: Consolidar DRE → Dia 15: Reunião Financeira (Marco + Ruy) → Decisões Registradas → Fim / Não: Dia 10: DRE → Dia 15: Reunião → Fim

10. Glossário

DRE: Demonstração do Resultado do Exercício — relatório que mostra receitas, custos e lucro.

EBITDA: lucro antes de juros, impostos, depreciação e amortização.

Fluxo de caixa projetado: estimativa de entradas e saídas nos próximos 90 dias.

Contingência: ações emergenciais para evitar crise de liquidez.

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Fluxo de Caixa e DRE Mensal</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-FIN-003</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Financeiro (Controladoria)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Dir. Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Manter visibilidade constante da saúde financeira da TBO através de fluxo de caixa projetado para 90 dias e DRE mensal, permitindo decisões informadas sobre investimentos, contratações e operação.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Projeção semanal de fluxo de caixa, DRE mensal consolidada, reunião financeira mensal entre sócios e plano de contingência para caixa negativo.</p><p><strong>2.2 Exclusões</strong></p><p>Contas a receber (SOP-FIN-001), contas a pagar (SOP-FIN-002), forecast comercial (SOP-COM-004), planejamento tributário (contabilidade externa).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Atualizar fluxo de caixa, consolidar DRE, acionar contingência</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Revisar DRE e participar de decisões estratégicas</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Contas a receber atualizadas; contas a pagar registradas; pipeline comercial ponderado (SOP-COM-004); extrato bancário atualizado.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>TBO OS (módulo financeiro), Omie ERP, Google Sheets (fluxo de caixa), BB Empresarial.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Fluxo de Caixa Projetado (semanal)</strong></p><p>Ação: Marco atualiza semanalmente a projeção para 90 dias, cruzando contas a receber (contratos + pipeline ponderado) com contas a pagar (fixas + variáveis previstas).</p><p>Responsável: Marco</p><p>Output: Fluxo de caixa atualizado</p><p>Prazo referência: Toda sexta-feira</p><p><strong>5.2. DRE Mensal</strong></p><p>Ação: Até dia 10, Marco consolida a DRE do mês anterior: Receita Bruta → Impostos → Receita Líquida → Custos de Produção → Margem Bruta → Despesas Operacionais → EBITDA.</p><p>Responsável: Marco</p><p>Output: DRE mensal consolidada</p><p>Prazo referência: Até dia 10 de cada mês</p><p><strong>5.3. Reunião Financeira Mensal</strong></p><p>Ação: Marco e Ruy revisam DRE e fluxo de caixa até dia 15. Decisões sobre investimentos, contratações ou cortes são registradas em ata no TBO OS.</p><p>Responsável: Marco + Ruy</p><p>Output: Ata com decisões financeiras registrada</p><p>Prazo referência: Até dia 15 de cada mês</p><p><strong>5.4. Plano de Contingência</strong></p><p>Ação: Se o fluxo projetado para 30 dias indicar saldo negativo, Marco aciona imediatamente: antecipação de recebíveis, renegociação de prazos com fornecedores, contenção de despesas variáveis.</p><p>Responsável: Marco</p><p>Output: Plano de contingência ativado</p><p>Prazo referência: Imediato quando detectado</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Fluxo de caixa atualizado semanalmente</li><li>[ ] DRE mensal consolidada até dia 10</li><li>[ ] Reunião financeira mensal realizada até dia 15</li><li>[ ] Plano de contingência acionado quando necessário</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Não projetar fluxo de caixa → surpresas de caixa negativo sem tempo de reação</li><li>DRE atrasada → decisões baseadas em feeling, não em dados</li><li>Ignorar saldo negativo projetado → crise de liquidez evitável</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS (financeiro), Omie ERP (dados contábeis), Google Sheets (projeções), BB Empresarial (extrato).</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Fluxo de caixa: atualização semanal (sexta)</li><li>DRE: até dia 10</li><li>Reunião financeira: até dia 15</li><li>Contingência: imediato se projeção 30d for negativa</li></ul><p><strong>9. Fluxograma</strong></p><p>Sexta: Atualizar Fluxo de Caixa → Projeção 30d negativa? → Sim: Acionar Contingência → Dia 10: Consolidar DRE → Dia 15: Reunião Financeira (Marco + Ruy) → Decisões Registradas → Fim / Não: Dia 10: DRE → Dia 15: Reunião → Fim</p><p><strong>10. Glossário</strong></p><p>DRE: Demonstração do Resultado do Exercício — relatório que mostra receitas, custos e lucro.</p><p>EBITDA: lucro antes de juros, impostos, depreciação e amortização.</p><p>Fluxo de caixa projetado: estimativa de entradas e saídas nos próximos 90 dias.</p><p>Contingência: ações emergenciais para evitar crise de liquidez.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['financeiro','fiscal','entrega','qualidade']::TEXT[],
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

  -- Steps for TBO-FIN-003
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Manter visibilidade constante da saúde financeira da TBO através de fluxo de caixa projetado para 90 dias e DRE mensal, permitindo decisões informadas sobre investimentos, contratações e operação.', '<p>Manter visibilidade constante da saúde financeira da TBO através de fluxo de caixa projetado para 90 dias e DRE mensal, permitindo decisões informadas sobre investimentos, contratações e operação.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Projeção semanal de fluxo de caixa, DRE mensal consolidada, reunião financeira mensal entre sócios e plano de contingência para caixa negativo.', '<p>Projeção semanal de fluxo de caixa, DRE mensal consolidada, reunião financeira mensal entre sócios e plano de contingência para caixa negativo.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Contas a receber (SOP-FIN-001), contas a pagar (SOP-FIN-002), forecast comercial (SOP-COM-004), planejamento tributário (contabilidade externa).', '<p>Contas a receber (SOP-FIN-001), contas a pagar (SOP-FIN-002), forecast comercial (SOP-COM-004), planejamento tributário (contabilidade externa).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco

Atualizar fluxo de caixa, consolidar DRE, acionar contingência

Executor

---

Ruy

Revisar DRE e participar de decisões estratégicas

Aprovador

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Atualizar fluxo de caixa, consolidar DRE, acionar contingência</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Revisar DRE e participar de decisões estratégicas</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contas a receber atualizadas; contas a pagar registradas; pipeline comercial ponderado (SOP-COM-004); extrato bancário atualizado.', '<p>Contas a receber atualizadas; contas a pagar registradas; pipeline comercial ponderado (SOP-COM-004); extrato bancário atualizado.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS (módulo financeiro), Omie ERP, Google Sheets (fluxo de caixa), BB Empresarial.', '<p>TBO OS (módulo financeiro), Omie ERP, Google Sheets (fluxo de caixa), BB Empresarial.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Fluxo de Caixa Projetado (semanal)', 'Ação: Marco atualiza semanalmente a projeção para 90 dias, cruzando contas a receber (contratos + pipeline ponderado) com contas a pagar (fixas + variáveis previstas).

Responsável: Marco

Output: Fluxo de caixa atualizado

Prazo referência: Toda sexta-feira', '<p>Ação: Marco atualiza semanalmente a projeção para 90 dias, cruzando contas a receber (contratos + pipeline ponderado) com contas a pagar (fixas + variáveis previstas).</p><p>Responsável: Marco</p><p>Output: Fluxo de caixa atualizado</p><p>Prazo referência: Toda sexta-feira</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. DRE Mensal', 'Ação: Até dia 10, Marco consolida a DRE do mês anterior: Receita Bruta → Impostos → Receita Líquida → Custos de Produção → Margem Bruta → Despesas Operacionais → EBITDA.

Responsável: Marco

Output: DRE mensal consolidada

Prazo referência: Até dia 10 de cada mês', '<p>Ação: Até dia 10, Marco consolida a DRE do mês anterior: Receita Bruta → Impostos → Receita Líquida → Custos de Produção → Margem Bruta → Despesas Operacionais → EBITDA.</p><p>Responsável: Marco</p><p>Output: DRE mensal consolidada</p><p>Prazo referência: Até dia 10 de cada mês</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Reunião Financeira Mensal', 'Ação: Marco e Ruy revisam DRE e fluxo de caixa até dia 15. Decisões sobre investimentos, contratações ou cortes são registradas em ata no TBO OS.

Responsável: Marco + Ruy

Output: Ata com decisões financeiras registrada

Prazo referência: Até dia 15 de cada mês', '<p>Ação: Marco e Ruy revisam DRE e fluxo de caixa até dia 15. Decisões sobre investimentos, contratações ou cortes são registradas em ata no TBO OS.</p><p>Responsável: Marco + Ruy</p><p>Output: Ata com decisões financeiras registrada</p><p>Prazo referência: Até dia 15 de cada mês</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Plano de Contingência', 'Ação: Se o fluxo projetado para 30 dias indicar saldo negativo, Marco aciona imediatamente: antecipação de recebíveis, renegociação de prazos com fornecedores, contenção de despesas variáveis.

Responsável: Marco

Output: Plano de contingência ativado

Prazo referência: Imediato quando detectado', '<p>Ação: Se o fluxo projetado para 30 dias indicar saldo negativo, Marco aciona imediatamente: antecipação de recebíveis, renegociação de prazos com fornecedores, contenção de despesas variáveis.</p><p>Responsável: Marco</p><p>Output: Plano de contingência ativado</p><p>Prazo referência: Imediato quando detectado</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Fluxo de caixa atualizado semanalmente

[ ] DRE mensal consolidada até dia 10

[ ] Reunião financeira mensal realizada até dia 15

[ ] Plano de contingência acionado quando necessário', '<ul><li>[ ] Fluxo de caixa atualizado semanalmente</li><li>[ ] DRE mensal consolidada até dia 10</li><li>[ ] Reunião financeira mensal realizada até dia 15</li><li>[ ] Plano de contingência acionado quando necessário</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Não projetar fluxo de caixa → surpresas de caixa negativo sem tempo de reação

DRE atrasada → decisões baseadas em feeling, não em dados

Ignorar saldo negativo projetado → crise de liquidez evitável', '<ul><li>Não projetar fluxo de caixa → surpresas de caixa negativo sem tempo de reação</li><li>DRE atrasada → decisões baseadas em feeling, não em dados</li><li>Ignorar saldo negativo projetado → crise de liquidez evitável</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (financeiro), Omie ERP (dados contábeis), Google Sheets (projeções), BB Empresarial (extrato).', '<p>TBO OS (financeiro), Omie ERP (dados contábeis), Google Sheets (projeções), BB Empresarial (extrato).</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Fluxo de caixa: atualização semanal (sexta)

DRE: até dia 10

Reunião financeira: até dia 15

Contingência: imediato se projeção 30d for negativa', '<ul><li>Fluxo de caixa: atualização semanal (sexta)</li><li>DRE: até dia 10</li><li>Reunião financeira: até dia 15</li><li>Contingência: imediato se projeção 30d for negativa</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Sexta: Atualizar Fluxo de Caixa → Projeção 30d negativa? → Sim: Acionar Contingência → Dia 10: Consolidar DRE → Dia 15: Reunião Financeira (Marco + Ruy) → Decisões Registradas → Fim / Não: Dia 10: DRE → Dia 15: Reunião → Fim', '<p>Sexta: Atualizar Fluxo de Caixa → Projeção 30d negativa? → Sim: Acionar Contingência → Dia 10: Consolidar DRE → Dia 15: Reunião Financeira (Marco + Ruy) → Decisões Registradas → Fim / Não: Dia 10: DRE → Dia 15: Reunião → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'DRE: Demonstração do Resultado do Exercício — relatório que mostra receitas, custos e lucro.

EBITDA: lucro antes de juros, impostos, depreciação e amortização.

Fluxo de caixa projetado: estimativa de entradas e saídas nos próximos 90 dias.

Contingência: ações emergenciais para evitar crise de liquidez.', '<p>DRE: Demonstração do Resultado do Exercício — relatório que mostra receitas, custos e lucro.</p><p>EBITDA: lucro antes de juros, impostos, depreciação e amortização.</p><p>Fluxo de caixa projetado: estimativa de entradas e saídas nos próximos 90 dias.</p><p>Contingência: ações emergenciais para evitar crise de liquidez.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-RH-001: Recrutamento e Selecao ──
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
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Onboarding de Colaborador',
    'tbo-rh-002-onboarding-de-colaborador',
    'recursos-humanos',
    'checklist',
    'Onboarding de Colaborador (People)',
    'Standard Operating Procedure

Onboarding de Colaborador (People)

Código

TBO-RH-002

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

Marco Andolfato



1. Objetivo

Garantir que todo novo membro seja integrado com clareza sobre cultura, processos, ferramentas e expectativas, reduzindo tempo até produtividade plena para no máximo 30 dias.

2. Escopo

2.1 O que está coberto

Pré-onboarding (acessos e contrato), dia 1 (cultura e ferramentas), primeira semana (processos), primeiras 4 semanas (imersão e avaliação).

2.2 Exclusões

Processo seletivo (SOP-RH-001), treinamentos técnicos específicos de BU (responsabilidade de cada PO), gestão de performance contínua (SOP-RH-003).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Configurar acessos, contrato, logística do onboarding

Executor

---

Marco

Apresentação cultural, check-ins quinzenais, avaliação de 30 dias

Executor

---

PO da BU

Mentor técnico, check-in diário na primeira semana, avaliação de 30 dias

Consultor

---

Novo Colaborador

Participar ativamente, completar checklist

Executor

---



4. Pré-requisitos

4.1 Inputs necessários

Contrato assinado; e-mail corporativo criado; acessos configurados (TBO OS, Google Workspace, ferramentas da BU); kit de boas-vindas digital preparado.

4.2 Ferramentas e Acessos

TBO OS (módulo People), Google Workspace, Google Meet, ClickSign.

5. Procedimento Passo a Passo

5.1. Pré-Onboarding (D-2)

Ação: Carol configura acessos (TBO OS role colaborador nível 3, Google Workspace, ferramentas da BU). Prepara kit digital: manual de cultura, organograma, SOPs da BU, calendário de rituais. Agenda reunião de boas-vindas.

Responsável: Carol (Ops)

Output: Acessos configurados, kit preparado

Prazo referência: 2 dias antes da entrada

5.2. Dia 1 — Cultura e Ferramentas

Ação: Marco apresenta: história da TBO, missão think-build-own, valores, clientes, posicionamento. Carol apresenta equipe e ferramentas. PO alinha escopo inicial e designa buddy.

Responsável: Marco + Carol + PO

Output: Colaborador ambientado

Prazo referência: Dia 1

5.3. Semana 1 — Processos

Ação: PO conduz treinamento de ferramentas da área. Carol orienta sobre processos operacionais (TBO OS, comunicação, gestão de arquivos). Check-in diário de 10 min com PO.

Responsável: PO + Carol

Output: Checklist de ferramentas concluído

Prazo referência: Dias 2–5

5.4. Semanas 2–4 — Imersão e Avaliação

Ação: Colaborador participa de projeto real como apoio. Check-in semanal com PO, quinzenal com Marco. Dia 30: avaliação formal (PO + Marco) com checklist de competências e feedback 360°.

Responsável: PO + Marco

Output: Avaliação de 30 dias registrada no TBO OS

Prazo referência: Até dia 30

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Acessos configurados antes do Dia 1

[ ] Kit de boas-vindas entregue

[ ] Apresentação cultural realizada

[ ] Checklist de ferramentas concluído

[ ] Buddy designado

[ ] Avaliação de 30 dias realizada e registrada

6.2 Erros Comuns a Evitar

Colaborador sem acesso no Dia 1 → primeira impressão negativa

Onboarding informal → não internaliza processos, gera retrabalho

Sem avaliação de 30 dias → problemas de performance descobertos tarde

7. Ferramentas e Templates

TBO OS (People, acessos), Google Workspace, Google Meet, ClickSign.

8. SLAs e Prazos

Acessos: D-2

Dia 1: cultura + ferramentas

Semana 1: processos e check-ins diários

Avaliação: até dia 30

Regra: nenhum colaborador inicia sem contrato e acessos configurados

9. Fluxograma

Contratação Aprovada → Pré-Onboarding D-2 (acessos + kit) → Dia 1 (cultura + ferramentas) → Semana 1 (processos + check-ins) → Semanas 2–4 (imersão + projeto real) → Avaliação 30 dias → Aprovado? → Sim: Operação normal → Fim / Não: Plano de ajuste → Fim

10. Glossário

Buddy: colega designado para apoiar o novo membro nas primeiras semanas.

Role: nível de permissão no TBO OS (colaborador = nível 3).

Check-in: conversa curta de acompanhamento entre gestor e colaborador.

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Onboarding de Colaborador (People)</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-RH-002</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Recursos Humanos (People)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Dir. Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Garantir que todo novo membro seja integrado com clareza sobre cultura, processos, ferramentas e expectativas, reduzindo tempo até produtividade plena para no máximo 30 dias.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Pré-onboarding (acessos e contrato), dia 1 (cultura e ferramentas), primeira semana (processos), primeiras 4 semanas (imersão e avaliação).</p><p><strong>2.2 Exclusões</strong></p><p>Processo seletivo (SOP-RH-001), treinamentos técnicos específicos de BU (responsabilidade de cada PO), gestão de performance contínua (SOP-RH-003).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Configurar acessos, contrato, logística do onboarding</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Apresentação cultural, check-ins quinzenais, avaliação de 30 dias</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>PO da BU</strong></p></td><td><p>Mentor técnico, check-in diário na primeira semana, avaliação de 30 dias</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Novo Colaborador</strong></p></td><td><p>Participar ativamente, completar checklist</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Contrato assinado; e-mail corporativo criado; acessos configurados (TBO OS, Google Workspace, ferramentas da BU); kit de boas-vindas digital preparado.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>TBO OS (módulo People), Google Workspace, Google Meet, ClickSign.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Pré-Onboarding (D-2)</strong></p><p>Ação: Carol configura acessos (TBO OS role colaborador nível 3, Google Workspace, ferramentas da BU). Prepara kit digital: manual de cultura, organograma, SOPs da BU, calendário de rituais. Agenda reunião de boas-vindas.</p><p>Responsável: Carol (Ops)</p><p>Output: Acessos configurados, kit preparado</p><p>Prazo referência: 2 dias antes da entrada</p><p><strong>5.2. Dia 1 — Cultura e Ferramentas</strong></p><p>Ação: Marco apresenta: história da TBO, missão think-build-own, valores, clientes, posicionamento. Carol apresenta equipe e ferramentas. PO alinha escopo inicial e designa buddy.</p><p>Responsável: Marco + Carol + PO</p><p>Output: Colaborador ambientado</p><p>Prazo referência: Dia 1</p><p><strong>5.3. Semana 1 — Processos</strong></p><p>Ação: PO conduz treinamento de ferramentas da área. Carol orienta sobre processos operacionais (TBO OS, comunicação, gestão de arquivos). Check-in diário de 10 min com PO.</p><p>Responsável: PO + Carol</p><p>Output: Checklist de ferramentas concluído</p><p>Prazo referência: Dias 2–5</p><p><strong>5.4. Semanas 2–4 — Imersão e Avaliação</strong></p><p>Ação: Colaborador participa de projeto real como apoio. Check-in semanal com PO, quinzenal com Marco. Dia 30: avaliação formal (PO + Marco) com checklist de competências e feedback 360°.</p><p>Responsável: PO + Marco</p><p>Output: Avaliação de 30 dias registrada no TBO OS</p><p>Prazo referência: Até dia 30</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Acessos configurados antes do Dia 1</li><li>[ ] Kit de boas-vindas entregue</li><li>[ ] Apresentação cultural realizada</li><li>[ ] Checklist de ferramentas concluído</li><li>[ ] Buddy designado</li><li>[ ] Avaliação de 30 dias realizada e registrada</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Colaborador sem acesso no Dia 1 → primeira impressão negativa</li><li>Onboarding informal → não internaliza processos, gera retrabalho</li><li>Sem avaliação de 30 dias → problemas de performance descobertos tarde</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS (People, acessos), Google Workspace, Google Meet, ClickSign.</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Acessos: D-2</li><li>Dia 1: cultura + ferramentas</li><li>Semana 1: processos e check-ins diários</li><li>Avaliação: até dia 30</li><li>Regra: nenhum colaborador inicia sem contrato e acessos configurados</li></ul><p><strong>9. Fluxograma</strong></p><p>Contratação Aprovada → Pré-Onboarding D-2 (acessos + kit) → Dia 1 (cultura + ferramentas) → Semana 1 (processos + check-ins) → Semanas 2–4 (imersão + projeto real) → Avaliação 30 dias → Aprovado? → Sim: Operação normal → Fim / Não: Plano de ajuste → Fim</p><p><strong>10. Glossário</strong></p><p>Buddy: colega designado para apoiar o novo membro nas primeiras semanas.</p><p>Role: nível de permissão no TBO OS (colaborador = nível 3).</p><p>Check-in: conversa curta de acompanhamento entre gestor e colaborador.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['rh','pessoas','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-RH-002
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Garantir que todo novo membro seja integrado com clareza sobre cultura, processos, ferramentas e expectativas, reduzindo tempo até produtividade plena para no máximo 30 dias.', '<p>Garantir que todo novo membro seja integrado com clareza sobre cultura, processos, ferramentas e expectativas, reduzindo tempo até produtividade plena para no máximo 30 dias.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Pré-onboarding (acessos e contrato), dia 1 (cultura e ferramentas), primeira semana (processos), primeiras 4 semanas (imersão e avaliação).', '<p>Pré-onboarding (acessos e contrato), dia 1 (cultura e ferramentas), primeira semana (processos), primeiras 4 semanas (imersão e avaliação).</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Processo seletivo (SOP-RH-001), treinamentos técnicos específicos de BU (responsabilidade de cada PO), gestão de performance contínua (SOP-RH-003).', '<p>Processo seletivo (SOP-RH-001), treinamentos técnicos específicos de BU (responsabilidade de cada PO), gestão de performance contínua (SOP-RH-003).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Configurar acessos, contrato, logística do onboarding

Executor

---

Marco

Apresentação cultural, check-ins quinzenais, avaliação de 30 dias

Executor

---

PO da BU

Mentor técnico, check-in diário na primeira semana, avaliação de 30 dias

Consultor

---

Novo Colaborador

Participar ativamente, completar checklist

Executor

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Configurar acessos, contrato, logística do onboarding</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Apresentação cultural, check-ins quinzenais, avaliação de 30 dias</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>PO da BU</strong></p></td><td><p>Mentor técnico, check-in diário na primeira semana, avaliação de 30 dias</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Novo Colaborador</strong></p></td><td><p>Participar ativamente, completar checklist</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato assinado; e-mail corporativo criado; acessos configurados (TBO OS, Google Workspace, ferramentas da BU); kit de boas-vindas digital preparado.', '<p>Contrato assinado; e-mail corporativo criado; acessos configurados (TBO OS, Google Workspace, ferramentas da BU); kit de boas-vindas digital preparado.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS (módulo People), Google Workspace, Google Meet, ClickSign.', '<p>TBO OS (módulo People), Google Workspace, Google Meet, ClickSign.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Pré-Onboarding (D-2)', 'Ação: Carol configura acessos (TBO OS role colaborador nível 3, Google Workspace, ferramentas da BU). Prepara kit digital: manual de cultura, organograma, SOPs da BU, calendário de rituais. Agenda reunião de boas-vindas.

Responsável: Carol (Ops)

Output: Acessos configurados, kit preparado

Prazo referência: 2 dias antes da entrada', '<p>Ação: Carol configura acessos (TBO OS role colaborador nível 3, Google Workspace, ferramentas da BU). Prepara kit digital: manual de cultura, organograma, SOPs da BU, calendário de rituais. Agenda reunião de boas-vindas.</p><p>Responsável: Carol (Ops)</p><p>Output: Acessos configurados, kit preparado</p><p>Prazo referência: 2 dias antes da entrada</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Dia 1 — Cultura e Ferramentas', 'Ação: Marco apresenta: história da TBO, missão think-build-own, valores, clientes, posicionamento. Carol apresenta equipe e ferramentas. PO alinha escopo inicial e designa buddy.

Responsável: Marco + Carol + PO

Output: Colaborador ambientado

Prazo referência: Dia 1', '<p>Ação: Marco apresenta: história da TBO, missão think-build-own, valores, clientes, posicionamento. Carol apresenta equipe e ferramentas. PO alinha escopo inicial e designa buddy.</p><p>Responsável: Marco + Carol + PO</p><p>Output: Colaborador ambientado</p><p>Prazo referência: Dia 1</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Semana 1 — Processos', 'Ação: PO conduz treinamento de ferramentas da área. Carol orienta sobre processos operacionais (TBO OS, comunicação, gestão de arquivos). Check-in diário de 10 min com PO.

Responsável: PO + Carol

Output: Checklist de ferramentas concluído

Prazo referência: Dias 2–5', '<p>Ação: PO conduz treinamento de ferramentas da área. Carol orienta sobre processos operacionais (TBO OS, comunicação, gestão de arquivos). Check-in diário de 10 min com PO.</p><p>Responsável: PO + Carol</p><p>Output: Checklist de ferramentas concluído</p><p>Prazo referência: Dias 2–5</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Semanas 2–4 — Imersão e Avaliação', 'Ação: Colaborador participa de projeto real como apoio. Check-in semanal com PO, quinzenal com Marco. Dia 30: avaliação formal (PO + Marco) com checklist de competências e feedback 360°.

Responsável: PO + Marco

Output: Avaliação de 30 dias registrada no TBO OS

Prazo referência: Até dia 30', '<p>Ação: Colaborador participa de projeto real como apoio. Check-in semanal com PO, quinzenal com Marco. Dia 30: avaliação formal (PO + Marco) com checklist de competências e feedback 360°.</p><p>Responsável: PO + Marco</p><p>Output: Avaliação de 30 dias registrada no TBO OS</p><p>Prazo referência: Até dia 30</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Acessos configurados antes do Dia 1

[ ] Kit de boas-vindas entregue

[ ] Apresentação cultural realizada

[ ] Checklist de ferramentas concluído

[ ] Buddy designado

[ ] Avaliação de 30 dias realizada e registrada', '<ul><li>[ ] Acessos configurados antes do Dia 1</li><li>[ ] Kit de boas-vindas entregue</li><li>[ ] Apresentação cultural realizada</li><li>[ ] Checklist de ferramentas concluído</li><li>[ ] Buddy designado</li><li>[ ] Avaliação de 30 dias realizada e registrada</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Colaborador sem acesso no Dia 1 → primeira impressão negativa

Onboarding informal → não internaliza processos, gera retrabalho

Sem avaliação de 30 dias → problemas de performance descobertos tarde', '<ul><li>Colaborador sem acesso no Dia 1 → primeira impressão negativa</li><li>Onboarding informal → não internaliza processos, gera retrabalho</li><li>Sem avaliação de 30 dias → problemas de performance descobertos tarde</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (People, acessos), Google Workspace, Google Meet, ClickSign.', '<p>TBO OS (People, acessos), Google Workspace, Google Meet, ClickSign.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Acessos: D-2

Dia 1: cultura + ferramentas

Semana 1: processos e check-ins diários

Avaliação: até dia 30

Regra: nenhum colaborador inicia sem contrato e acessos configurados', '<ul><li>Acessos: D-2</li><li>Dia 1: cultura + ferramentas</li><li>Semana 1: processos e check-ins diários</li><li>Avaliação: até dia 30</li><li>Regra: nenhum colaborador inicia sem contrato e acessos configurados</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Contratação Aprovada → Pré-Onboarding D-2 (acessos + kit) → Dia 1 (cultura + ferramentas) → Semana 1 (processos + check-ins) → Semanas 2–4 (imersão + projeto real) → Avaliação 30 dias → Aprovado? → Sim: Operação normal → Fim / Não: Plano de ajuste → Fim', '<p>Contratação Aprovada → Pré-Onboarding D-2 (acessos + kit) → Dia 1 (cultura + ferramentas) → Semana 1 (processos + check-ins) → Semanas 2–4 (imersão + projeto real) → Avaliação 30 dias → Aprovado? → Sim: Operação normal → Fim / Não: Plano de ajuste → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Buddy: colega designado para apoiar o novo membro nas primeiras semanas.

Role: nível de permissão no TBO OS (colaborador = nível 3).

Check-in: conversa curta de acompanhamento entre gestor e colaborador.', '<p>Buddy: colega designado para apoiar o novo membro nas primeiras semanas.</p><p>Role: nível de permissão no TBO OS (colaborador = nível 3).</p><p>Check-in: conversa curta de acompanhamento entre gestor e colaborador.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-RH-003: Avaliacao de Performance e Desenvolvimento ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Avaliacao de Performance e Desenvolvimento',
    'tbo-rh-003-avaliacao-de-performance-e-desenvolvimento',
    'recursos-humanos',
    'checklist',
    'Avaliação de Performance e Desenvolvimento',
    'Standard Operating Procedure

Avaliação de Performance e Desenvolvimento

Código

TBO-RH-003

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

Marco Andolfato



1. Objetivo

Criar cultura de feedback estruturado na TBO, com avaliações regulares, metas claras e oportunidades de desenvolvimento para cada membro do time.

2. Escopo

2.1 O que está coberto

1:1 mensal, avaliação trimestral, avaliação anual, plano de desenvolvimento individual e regras para decisões de performance.

2.2 Exclusões

Recrutamento (SOP-RH-001), onboarding (SOP-RH-002), desligamento (SOP-RH-004).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

PO da BU

Conduzir 1:1 mensal e preencher avaliação

Executor

---

Marco

Avaliação trimestral e anual, decisões de performance

Aprovador

---

Colaborador

Participar, dar e receber feedback, cumprir plano de ação

Executor

---



4. Pré-requisitos

4.1 Inputs necessários

Formulário de avaliação configurado no TBO OS (People); critérios por BU definidos; histórico de entregas do colaborador.

4.2 Ferramentas e Acessos

TBO OS (módulo People), Google Meet.

5. Procedimento Passo a Passo

5.1. 1:1 Mensal (PO ↔ Colaborador)

Ação: PO conduz conversa de 30 min com agenda aberta + checklist de performance: qualidade de entregas, prazos, colaboração, iniciativa, aderência aos SOPs. Resultado registrado no TBO OS.

Responsável: PO da BU

Output: Registro de 1:1 no TBO OS

Prazo referência: Mensal

5.2. Avaliação Trimestral

Ação: Marco conversa individualmente com cada colaborador sobre performance geral, alinhamento cultural e aspirações. Plano de ação definido para o próximo trimestre.

Responsável: Marco

Output: Avaliação trimestral registrada com plano de ação

Prazo referência: Trimestral

5.3. Avaliação Anual

Ação: Revisão completa: performance do ano, metas atingidas, feedback consolidado. Decisão sobre: ajuste salarial, promoção, manutenção ou plano de melhoria.

Responsável: Marco + Ruy

Output: Avaliação anual registrada, decisões formalizadas

Prazo referência: Dezembro/Janeiro

5.4. Gestão de Baixa Performance

Ação: Se performance abaixo do esperado: plano de melhoria formal (mínimo 30 dias) com metas claras. Se não melhorar após 2 ciclos documentados: processo de desligamento (SOP-RH-004).

Responsável: Marco

Output: Plano de melhoria ou decisão de desligamento

Prazo referência: Conforme ciclo

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] 1:1 mensal realizada e registrada

[ ] Avaliação trimestral concluída

[ ] Avaliação anual com decisões formalizadas

[ ] Plano de melhoria documentado (quando aplicável)

6.2 Erros Comuns a Evitar

1:1 sem registro → feedback se perde, padrões não aparecem

Avaliar sem exemplos concretos → feedback genérico não gera ação

Demitir sem feedback documentado → risco trabalhista e cultural

7. Ferramentas e Templates

TBO OS (People), Google Meet.

8. SLAs e Prazos

1:1: mensal

Avaliação trimestral: a cada 3 meses

Avaliação anual: dezembro/janeiro

Plano de melhoria: mínimo 30 dias antes de decisão de desligamento

9. Fluxograma

Mensal: 1:1 (PO + Colaborador) → Trimestral: Avaliação (Marco) → Plano de Ação → Anual: Revisão Completa → Promoção / Manutenção / Plano de Melhoria → Se melhoria: 30 dias → Melhorou? → Sim: Continua / Não: SOP-RH-004

10. Glossário

1:1: reunião individual entre gestor e colaborador para feedback.

Plano de melhoria: documento formal com metas específicas e prazo para evolução.

Feedback 360°: avaliação coletada de pares, líderes e liderados.

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Avaliação de Performance e Desenvolvimento</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-RH-003</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Recursos Humanos (People)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Dir. Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Criar cultura de feedback estruturado na TBO, com avaliações regulares, metas claras e oportunidades de desenvolvimento para cada membro do time.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>1:1 mensal, avaliação trimestral, avaliação anual, plano de desenvolvimento individual e regras para decisões de performance.</p><p><strong>2.2 Exclusões</strong></p><p>Recrutamento (SOP-RH-001), onboarding (SOP-RH-002), desligamento (SOP-RH-004).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>PO da BU</strong></p></td><td><p>Conduzir 1:1 mensal e preencher avaliação</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Avaliação trimestral e anual, decisões de performance</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Colaborador</strong></p></td><td><p>Participar, dar e receber feedback, cumprir plano de ação</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Formulário de avaliação configurado no TBO OS (People); critérios por BU definidos; histórico de entregas do colaborador.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>TBO OS (módulo People), Google Meet.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. 1:1 Mensal (PO ↔ Colaborador)</strong></p><p>Ação: PO conduz conversa de 30 min com agenda aberta + checklist de performance: qualidade de entregas, prazos, colaboração, iniciativa, aderência aos SOPs. Resultado registrado no TBO OS.</p><p>Responsável: PO da BU</p><p>Output: Registro de 1:1 no TBO OS</p><p>Prazo referência: Mensal</p><p><strong>5.2. Avaliação Trimestral</strong></p><p>Ação: Marco conversa individualmente com cada colaborador sobre performance geral, alinhamento cultural e aspirações. Plano de ação definido para o próximo trimestre.</p><p>Responsável: Marco</p><p>Output: Avaliação trimestral registrada com plano de ação</p><p>Prazo referência: Trimestral</p><p><strong>5.3. Avaliação Anual</strong></p><p>Ação: Revisão completa: performance do ano, metas atingidas, feedback consolidado. Decisão sobre: ajuste salarial, promoção, manutenção ou plano de melhoria.</p><p>Responsável: Marco + Ruy</p><p>Output: Avaliação anual registrada, decisões formalizadas</p><p>Prazo referência: Dezembro/Janeiro</p><p><strong>5.4. Gestão de Baixa Performance</strong></p><p>Ação: Se performance abaixo do esperado: plano de melhoria formal (mínimo 30 dias) com metas claras. Se não melhorar após 2 ciclos documentados: processo de desligamento (SOP-RH-004).</p><p>Responsável: Marco</p><p>Output: Plano de melhoria ou decisão de desligamento</p><p>Prazo referência: Conforme ciclo</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] 1:1 mensal realizada e registrada</li><li>[ ] Avaliação trimestral concluída</li><li>[ ] Avaliação anual com decisões formalizadas</li><li>[ ] Plano de melhoria documentado (quando aplicável)</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>1:1 sem registro → feedback se perde, padrões não aparecem</li><li>Avaliar sem exemplos concretos → feedback genérico não gera ação</li><li>Demitir sem feedback documentado → risco trabalhista e cultural</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS (People), Google Meet.</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>1:1: mensal</li><li>Avaliação trimestral: a cada 3 meses</li><li>Avaliação anual: dezembro/janeiro</li><li>Plano de melhoria: mínimo 30 dias antes de decisão de desligamento</li></ul><p><strong>9. Fluxograma</strong></p><p>Mensal: 1:1 (PO + Colaborador) → Trimestral: Avaliação (Marco) → Plano de Ação → Anual: Revisão Completa → Promoção / Manutenção / Plano de Melhoria → Se melhoria: 30 dias → Melhorou? → Sim: Continua / Não: SOP-RH-004</p><p><strong>10. Glossário</strong></p><p>1:1: reunião individual entre gestor e colaborador para feedback.</p><p>Plano de melhoria: documento formal com metas específicas e prazo para evolução.</p><p>Feedback 360°: avaliação coletada de pares, líderes e liderados.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['rh','pessoas','entrega','qualidade','aprovacao']::TEXT[],
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

  -- Steps for TBO-RH-003
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Criar cultura de feedback estruturado na TBO, com avaliações regulares, metas claras e oportunidades de desenvolvimento para cada membro do time.', '<p>Criar cultura de feedback estruturado na TBO, com avaliações regulares, metas claras e oportunidades de desenvolvimento para cada membro do time.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', '1:1 mensal, avaliação trimestral, avaliação anual, plano de desenvolvimento individual e regras para decisões de performance.', '<p>1:1 mensal, avaliação trimestral, avaliação anual, plano de desenvolvimento individual e regras para decisões de performance.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Recrutamento (SOP-RH-001), onboarding (SOP-RH-002), desligamento (SOP-RH-004).', '<p>Recrutamento (SOP-RH-001), onboarding (SOP-RH-002), desligamento (SOP-RH-004).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

PO da BU

Conduzir 1:1 mensal e preencher avaliação

Executor

---

Marco

Avaliação trimestral e anual, decisões de performance

Aprovador

---

Colaborador

Participar, dar e receber feedback, cumprir plano de ação

Executor

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>PO da BU</strong></p></td><td><p>Conduzir 1:1 mensal e preencher avaliação</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Avaliação trimestral e anual, decisões de performance</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Colaborador</strong></p></td><td><p>Participar, dar e receber feedback, cumprir plano de ação</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Formulário de avaliação configurado no TBO OS (People); critérios por BU definidos; histórico de entregas do colaborador.', '<p>Formulário de avaliação configurado no TBO OS (People); critérios por BU definidos; histórico de entregas do colaborador.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS (módulo People), Google Meet.', '<p>TBO OS (módulo People), Google Meet.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. 1:1 Mensal (PO ↔ Colaborador)', 'Ação: PO conduz conversa de 30 min com agenda aberta + checklist de performance: qualidade de entregas, prazos, colaboração, iniciativa, aderência aos SOPs. Resultado registrado no TBO OS.

Responsável: PO da BU

Output: Registro de 1:1 no TBO OS

Prazo referência: Mensal', '<p>Ação: PO conduz conversa de 30 min com agenda aberta + checklist de performance: qualidade de entregas, prazos, colaboração, iniciativa, aderência aos SOPs. Resultado registrado no TBO OS.</p><p>Responsável: PO da BU</p><p>Output: Registro de 1:1 no TBO OS</p><p>Prazo referência: Mensal</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Avaliação Trimestral', 'Ação: Marco conversa individualmente com cada colaborador sobre performance geral, alinhamento cultural e aspirações. Plano de ação definido para o próximo trimestre.

Responsável: Marco

Output: Avaliação trimestral registrada com plano de ação

Prazo referência: Trimestral', '<p>Ação: Marco conversa individualmente com cada colaborador sobre performance geral, alinhamento cultural e aspirações. Plano de ação definido para o próximo trimestre.</p><p>Responsável: Marco</p><p>Output: Avaliação trimestral registrada com plano de ação</p><p>Prazo referência: Trimestral</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Avaliação Anual', 'Ação: Revisão completa: performance do ano, metas atingidas, feedback consolidado. Decisão sobre: ajuste salarial, promoção, manutenção ou plano de melhoria.

Responsável: Marco + Ruy

Output: Avaliação anual registrada, decisões formalizadas

Prazo referência: Dezembro/Janeiro', '<p>Ação: Revisão completa: performance do ano, metas atingidas, feedback consolidado. Decisão sobre: ajuste salarial, promoção, manutenção ou plano de melhoria.</p><p>Responsável: Marco + Ruy</p><p>Output: Avaliação anual registrada, decisões formalizadas</p><p>Prazo referência: Dezembro/Janeiro</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Gestão de Baixa Performance', 'Ação: Se performance abaixo do esperado: plano de melhoria formal (mínimo 30 dias) com metas claras. Se não melhorar após 2 ciclos documentados: processo de desligamento (SOP-RH-004).

Responsável: Marco

Output: Plano de melhoria ou decisão de desligamento

Prazo referência: Conforme ciclo', '<p>Ação: Se performance abaixo do esperado: plano de melhoria formal (mínimo 30 dias) com metas claras. Se não melhorar após 2 ciclos documentados: processo de desligamento (SOP-RH-004).</p><p>Responsável: Marco</p><p>Output: Plano de melhoria ou decisão de desligamento</p><p>Prazo referência: Conforme ciclo</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] 1:1 mensal realizada e registrada

[ ] Avaliação trimestral concluída

[ ] Avaliação anual com decisões formalizadas

[ ] Plano de melhoria documentado (quando aplicável)', '<ul><li>[ ] 1:1 mensal realizada e registrada</li><li>[ ] Avaliação trimestral concluída</li><li>[ ] Avaliação anual com decisões formalizadas</li><li>[ ] Plano de melhoria documentado (quando aplicável)</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', '1:1 sem registro → feedback se perde, padrões não aparecem

Avaliar sem exemplos concretos → feedback genérico não gera ação

Demitir sem feedback documentado → risco trabalhista e cultural', '<ul><li>1:1 sem registro → feedback se perde, padrões não aparecem</li><li>Avaliar sem exemplos concretos → feedback genérico não gera ação</li><li>Demitir sem feedback documentado → risco trabalhista e cultural</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (People), Google Meet.', '<p>TBO OS (People), Google Meet.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', '1:1: mensal

Avaliação trimestral: a cada 3 meses

Avaliação anual: dezembro/janeiro

Plano de melhoria: mínimo 30 dias antes de decisão de desligamento', '<ul><li>1:1: mensal</li><li>Avaliação trimestral: a cada 3 meses</li><li>Avaliação anual: dezembro/janeiro</li><li>Plano de melhoria: mínimo 30 dias antes de decisão de desligamento</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Mensal: 1:1 (PO + Colaborador) → Trimestral: Avaliação (Marco) → Plano de Ação → Anual: Revisão Completa → Promoção / Manutenção / Plano de Melhoria → Se melhoria: 30 dias → Melhorou? → Sim: Continua / Não: SOP-RH-004', '<p>Mensal: 1:1 (PO + Colaborador) → Trimestral: Avaliação (Marco) → Plano de Ação → Anual: Revisão Completa → Promoção / Manutenção / Plano de Melhoria → Se melhoria: 30 dias → Melhorou? → Sim: Continua / Não: SOP-RH-004</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', '1:1: reunião individual entre gestor e colaborador para feedback.

Plano de melhoria: documento formal com metas específicas e prazo para evolução.

Feedback 360°: avaliação coletada de pares, líderes e liderados.', '<p>1:1: reunião individual entre gestor e colaborador para feedback.</p><p>Plano de melhoria: documento formal com metas específicas e prazo para evolução.</p><p>Feedback 360°: avaliação coletada de pares, líderes e liderados.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-RH-004: Desligamento e Offboarding ──
END $$;