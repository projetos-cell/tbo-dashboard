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
END $$;